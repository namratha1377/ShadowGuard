import { useEffect, useState } from 'react';
import { Card } from '../components/cards/Card';
import { LoadingState } from '../components/common/EmptyState';
import { Toggle } from '../components/common/Toggle';
import { Header, Layout } from '../components/layout/Layout';
import {
  getGovernancePreferences,
  getNotificationPreferences,
  getOrganizationSettings,
  getUserProfile,
} from '../services/api';
import type {
  GovernancePreferences,
  NotificationPreferences,
  OrganizationSettings,
  UserProfile,
} from '../types';
import { formatTimestamp } from '../utils/format';

export function SettingsPage() {
  const [org, setOrg] = useState<OrganizationSettings | null>(null);
  const [governance, setGovernance] = useState<GovernancePreferences | null>(null);
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOrganizationSettings(),
      getGovernancePreferences(),
      getNotificationPreferences(),
      getUserProfile(),
    ]).then(([o, g, n, u]) => {
      setOrg(o);
      setGovernance(g);
      setNotifications(n);
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading || !org || !governance || !notifications || !user) {
    return (
      <Layout>
        <Header title="Settings" subtitle="Organization and governance configuration" />
        <LoadingState message="Loading settings..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Settings" subtitle="Organization and governance configuration" />

      <div className="p-6 space-y-6 max-w-4xl">
        <Card title="Organization Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField label="Organization Name" value={org.name} />
            <SettingField label="Domain" value={org.domain} />
            <SettingField label="Industry" value={org.industry} />
            <SettingField label="Employee Count" value={org.employeeCount.toLocaleString()} />
            <SettingField label="Plan" value={org.plan} />
          </div>
        </Card>

        <Card title="Governance Preferences">
          <div className="space-y-4">
            <SettingRow
              label="Default Policy Action"
              description="Action applied when no specific policy matches"
              value={governance.defaultPolicyAction}
            />
            <ToggleRow
              label="Auto-block Critical Detections"
              description="Automatically block requests with critical risk level"
              enabled={governance.autoBlockCritical}
              onChange={(v) => setGovernance({ ...governance, autoBlockCritical: v })}
            />
            <ToggleRow
              label="Require Approval for Restricted"
              description="Require manager approval for restricted requests"
              enabled={governance.requireApprovalForRestricted}
              onChange={(v) => setGovernance({ ...governance, requireApprovalForRestricted: v })}
            />
            <SettingRow
              label="Data Retention Period"
              description="Days to retain interaction logs"
              value={`${governance.dataRetentionDays} days`}
            />
            <ToggleRow
              label="Scan Attachments"
              description="Scan uploaded files for sensitive data patterns"
              enabled={governance.scanAttachments}
              onChange={(v) => setGovernance({ ...governance, scanAttachments: v })}
            />
            <ToggleRow
              label="Monitor Clipboard"
              description="Detect sensitive data pasted into AI prompts"
              enabled={governance.monitorClipboard}
              onChange={(v) => setGovernance({ ...governance, monitorClipboard: v })}
            />
          </div>
        </Card>

        <Card title="Notification Preferences">
          <div className="space-y-4">
            <ToggleRow
              label="Email Alerts"
              description="Send email notifications for governance events"
              enabled={notifications.emailAlerts}
              onChange={(v) => setNotifications({ ...notifications, emailAlerts: v })}
            />
            <ToggleRow
              label="Slack Integration"
              description="Post alerts to configured Slack channels"
              enabled={notifications.slackIntegration}
              onChange={(v) => setNotifications({ ...notifications, slackIntegration: v })}
            />
            <ToggleRow
              label="Critical Only"
              description="Only notify for critical severity events"
              enabled={notifications.criticalOnly}
              onChange={(v) => setNotifications({ ...notifications, criticalOnly: v })}
            />
            <ToggleRow
              label="Daily Digest"
              description="Send daily summary of AI governance activity"
              enabled={notifications.dailyDigest}
              onChange={(v) => setNotifications({ ...notifications, dailyDigest: v })}
            />
            <div>
              <p className="text-xs text-text-muted mb-1">Alert Recipients</p>
              <div className="flex flex-wrap gap-2">
                {notifications.alertRecipients.map((email) => (
                  <span key={email} className="px-2 py-1 text-xs bg-bg-primary border border-border rounded text-text-secondary">
                    {email}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="User Profile">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 text-sm font-semibold bg-neutral-700 rounded text-text-primary">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <SettingField label="Name" value={user.name} />
              <SettingField label="Email" value={user.email} />
              <SettingField label="Role" value={user.role} />
              <SettingField label="Department" value={user.department} />
              <SettingField label="Last Login" value={formatTimestamp(user.lastLogin)} />
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  );
}

function SettingRow({ label, description, value }: { label: string; description: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
      <div>
        <p className="text-sm text-text-primary">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <span className="text-sm text-text-secondary capitalize">{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
      <div>
        <p className="text-sm text-text-primary">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}
