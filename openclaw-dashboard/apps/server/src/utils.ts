import crypto from 'node:crypto';

export const summarize = (text: string) => {
  const chunks = text.split('.').map(s => s.trim()).filter(Boolean);
  return chunks.slice(0, 3).join('. ') + (chunks.length ? '.' : '');
};

export const encryptSecret = (value: string, key: string) => {
  const iv = crypto.randomBytes(16);
  const hashKey = crypto.createHash('sha256').update(key).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', hashKey, iv);
  const enc = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${enc.toString('hex')}`;
};
