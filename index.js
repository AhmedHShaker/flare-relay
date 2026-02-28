const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ZOHO_USER,
    pass: process.env.ZOHO_PASS,
  },
});

app.post('/send', async (req, res) => {
  const { to, subject, text, secret } = req.body;

  if (secret !== process.env.RELAY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await transporter.sendMail({
      from: 'Ahmed from Flare <hello@onflare.co>',
      replyTo: 'hello@onflare.co',
      to,
      subject,
      text,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Send failed:', err.message, err.code, err.responseCode);
    res.status(500).json({ error: 'Send failed', detail: err.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Relay listening on port ' + port));
