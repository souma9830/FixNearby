/**
 * @fileoverview Notification Preferences Page Component
 */

import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Star, Shield, Smartphone, Send, RotateCcw, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useToast from '../../hooks/useToast';
import api from '../../services/apiClient';

const defaultPreferences = {
  booking: { email: true, sms: true, push: true },
  messages: { email: true, sms: false, push: true },
  reviews: { email: true, sms: false, push: true },
  promotions: { email: true, sms: false, push: false },
  system: { email: true, sms: true, push: true }
};

const sections = [
  { id: 'booking', title: 'Booking Updates', description: 'New bookings, status changes, and reminders', icon: Bell },
  { id: 'messages', title: 'Messages', description: 'New chat messages and quote responses', icon: MessageSquare },
  { id: 'reviews', title: 'Reviews', description: 'New reviews received and review replies', icon: Star },
  { id: 'promotions', title: 'Promotions', description: 'Special offers and featured worker alerts', icon: Send },
  { id: 'system', title: 'System', description: 'Security alerts, maintenance, and policy updates', icon: Shield }
];

export default function NotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      // Fallback if apiClient setup differs slightly
      const { data } = await api.get('/api/notification-preferences');
      if (data.success && data.data) {
        setPreferences(data.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (section, channel) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [channel]: !prev[section][channel]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.put('/api/notification-preferences', { preferences });
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Notification preferences saved successfully',
        });
        setPreferences(data.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    toast({
      title: 'Info',
      description: 'Preferences reset to defaults. Remember to save.',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage how you receive updates and alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map(({ id, title, description, icon: Icon }) => (
          <div key={id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-start gap-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
              </div>
            </div>
            
            <div className="p-5 bg-gray-50/50 dark:bg-gray-800/50 flex flex-wrap gap-6">
              {[
                { channel: 'email', label: 'Email', icon: Mail },
                { channel: 'sms', label: 'SMS', icon: Smartphone },
                { channel: 'push', label: 'Push Notification', icon: Bell }
              ].map(({ channel, label, icon: ChannelIcon }) => (
                <label key={channel} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={preferences[id]?.[channel] || false}
                      onChange={() => handleToggle(id, channel)}
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      preferences[id]?.[channel] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        preferences[id]?.[channel] ? 'transform translate-x-5' : ''
                      }`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    <ChannelIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {label}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
