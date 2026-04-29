import emailjs from '@emailjs/browser';
import { Student } from '../types';
import { SchoolSettings } from '../components/SchoolSettingsModal';

export interface EmailSettings {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

const EMAIL_SETTINGS_KEY = 'sms_email_settings';

export function loadEmailSettings(): EmailSettings {
  try {
    return JSON.parse(localStorage.getItem(EMAIL_SETTINGS_KEY) || '{}');
  } catch {
    return { serviceId: '', templateId: '', publicKey: '' };
  }
}

export function saveEmailSettings(settings: EmailSettings): void {
  localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(settings));
}

export async function sendTuitionReminder(
  student: Student,
  schoolSettings: SchoolSettings
): Promise<void> {
  const emailSettings = loadEmailSettings();
  if (!emailSettings.serviceId || !emailSettings.templateId || !emailSettings.publicKey) {
    throw new Error('EmailJS の設定が未完了です。メール設定画面で Service ID・Template ID・Public Key を入力してください。');
  }

  const toEmail = student.emergencyContact?.email;
  if (!toEmail) {
    throw new Error('緊急連絡先のメールアドレスが登録されていません。');
  }

  const balance = student.tuitionBalance ?? (student.tuitionTotal - student.tuitionPaid);
  const deadline = student.nextTuitionDeadline || '未設定';

  const templateParams = {
    to_email: toEmail,
    to_name: student.emergencyContact?.name || student.name,
    student_name: student.name,
    student_id: student.studentId,
    unpaid_amount: balance.toLocaleString(),
    deadline: deadline,
    tuition_status: student.tuitionStatus,
    school_name: schoolSettings.schoolName || '日本語学校',
    school_address: schoolSettings.schoolAddress || '',
    school_phone: (schoolSettings as any).phone || '',
    subject: `【学費納付のお願い】${schoolSettings.schoolName || '日本語学校'}より`,
  };

  await emailjs.send(
    emailSettings.serviceId,
    emailSettings.templateId,
    templateParams,
    emailSettings.publicKey
  );
}
