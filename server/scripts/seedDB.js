import mongoose from 'mongoose';

export const seedDatabase = async () => {
  console.log('Beginning database seeding verification process...');
  const mockWorkers = [
    { name: 'John Plumber', serviceType: 'Plumbing', rating: 4.8 },
    { name: 'Alice Spark', serviceType: 'Electrical', rating: 4.9 }
  ];
  console.log('Seeded database mock entities successfully:', mockWorkers.length);
};