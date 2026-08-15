import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { sanitizeAttachment } from '../utils/attachmentSanitizer.js';

dotenv.config();

async function runTests() {
  console.log('--- STARTING CHAT ATTACHMENT SUPPORT TESTS ---');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  const testEmail = 'test_attach_msg@example.com';
  await User.deleteMany({ email: testEmail });
  await Message.deleteMany({ senderModel: 'User', text: /^attachment test/ });

  try {
    const user = await User.create({
      name: 'Attachment Test User',
      email: testEmail,
      password: 'Password123'
    });

    // --- Sanitizer unit checks ---
    console.log('\nTest 1: sanitizeAttachment whitelists valid metadata and drops extra fields');
    const clean = sanitizeAttachment({
      fileUrl: '/uploads/img-123.png',
      fileName: 'photo.png',
      fileType: 'image/png',
      fileSize: 2048,
      injected: 'xss'
    });
    if (!clean || clean.fileUrl !== '/uploads/img-123.png' || 'injected' in clean) {
      throw new Error('Sanitizer did not whitelist attachment fields');
    }
    console.log('SUCCESS: sanitizer keeps only known fields.');

    console.log('\nTest 2: sanitizeAttachment rejects malformed payloads');
    if (sanitizeAttachment(null) !== null) throw new Error('null not rejected');
    if (sanitizeAttachment({ fileUrl: 'javascript:alert(1)', fileName: 'a', fileType: 'image/png', fileSize: 1 }) !== null) {
      throw new Error('non-/uploads non-http URL not rejected');
    }
    if (sanitizeAttachment({ fileUrl: '/uploads/a', fileName: 'a', fileType: 'image/png', fileSize: -5 }) !== null) {
      throw new Error('negative fileSize not rejected');
    }
    if (sanitizeAttachment({ fileUrl: '/uploads/a', fileName: 'a', fileType: 'image/png', fileSize: 99999999999999 }) !== null) {
      throw new Error('oversized fileSize not rejected');
    }
    console.log('SUCCESS: malformed attachments rejected.');

    // --- Schema checks ---
    console.log('\nTest 3: attachment-only message persists with validated attachment');
    const attachMsg = await Message.create({
      senderId: user._id,
      senderModel: 'User',
      receiverId: user._id,
      receiverModel: 'User',
      text: '',
      attachment: { fileUrl: '/uploads/doc-1.pdf', fileName: 'invoice.pdf', fileType: 'application/pdf', fileSize: 12345 }
    });
    const fetched = await Message.findById(attachMsg._id);
    if (!fetched.attachment || fetched.attachment.fileUrl !== '/uploads/doc-1.pdf') {
      throw new Error('Attachment was not persisted');
    }
    if (fetched.attachment._id !== undefined) {
      throw new Error('Attachment subdocument should not expose _id');
    }
    console.log('SUCCESS: attachment persisted without _id.');

    console.log('\nTest 4: text-only message still validates (no attachment required)');
    const textMsg = await Message.create({
      senderId: user._id,
      senderModel: 'User',
      receiverId: user._id,
      receiverModel: 'User',
      text: 'attachment test — plain text'
    });
    if (!textMsg.text) throw new Error('Text message not persisted');
    console.log('SUCCESS: text-only message persists.');

    console.log('\nTest 5: message with neither text nor attachment is rejected');
    let rejected = false;
    try {
      await Message.create({
        senderId: user._id,
        senderModel: 'User',
        receiverId: user._id,
        receiverModel: 'User',
        text: '',
        attachment: null
      });
    } catch (err) {
      rejected = true;
    }
    if (!rejected) throw new Error('Empty message was not rejected by validation');
    console.log('SUCCESS: empty message rejected by validator.');

    console.log('\nTest 6: invalid attachment fields are rejected by the schema');
    let invalidRejected = false;
    try {
      await Message.create({
        senderId: user._id,
        senderModel: 'User',
        receiverId: user._id,
        receiverModel: 'User',
        text: 'attachment test',
        attachment: { fileUrl: '', fileName: 'a', fileType: 'image/png', fileSize: 1 }
      });
    } catch (err) {
      invalidRejected = true;
    }
    if (!invalidRejected) throw new Error('Attachment with empty fileUrl not rejected');
    console.log('SUCCESS: invalid attachment rejected.');

    // --- Schema cleanup check ---
    console.log('\nTest 7: duplicate status/readAt paths removed (single keys)');
    const paths = Object.keys(Message.schema.paths);
    const statusCount = paths.filter((p) => p === 'status').length;
    const readAtCount = paths.filter((p) => p === 'readAt').length;
    if (statusCount !== 1 || readAtCount !== 1) {
      throw new Error(`Expected single status/readAt paths, got status=${statusCount} readAt=${readAtCount}`);
    }
    console.log('SUCCESS: schema has single status and readAt paths.');

    console.log('\n=============================================');
    console.log('ALL CHAT ATTACHMENT SUPPORT TESTS PASSED!');
    console.log('=============================================');
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error);
    process.exit(1);
  } finally {
    await User.deleteMany({ email: testEmail });
    await Message.deleteMany({ senderModel: 'User', text: /^attachment test/ });
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests();
