import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();

const port = process.env.PORT || 4000;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment');
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-15' });

const state = {
  landlords: [],
  beds: [],
  applications: [],
  listings: [],
  transactions: [],
};

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function allocateApplication(application) {
  const availableBed = state.beds.find((bed) => bed.status === 'available' && bed.gender === application.gender);
  if (!availableBed) {
    return { success: false, reason: 'no_capacity' };
  }

  availableBed.status = 'occupied';
  availableBed.occupant = { matric: application.matric, name: application.name };
  application.status = 'allocated';
  application.allocatedBedId = availableBed.id;
  return { success: true, bed: availableBed };
}

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'UniNest FUW backend is running' });
});

app.get('/api/state', (req, res) => {
  res.json(state);
});

app.get('/api/listings', (req, res) => {
  res.json(state.listings);
});

app.post('/api/landlords', (req, res) => {
  const { name, phone, nin, address } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const landlord = {
    id: genId('landlord'),
    name,
    phone,
    nin: nin || '',
    address: address || '',
    kycStatus: nin && nin.length >= 10 ? 'verified' : 'pending',
  };
  state.landlords.push(landlord);
  res.status(201).json(landlord);
});

app.put('/api/landlords/:id/verify', (req, res) => {
  const landlord = state.landlords.find((item) => item.id === req.params.id);
  if (!landlord) {
    return res.status(404).json({ error: 'Landlord not found' });
  }
  landlord.kycStatus = 'verified';
  res.json(landlord);
});

app.post('/api/beds', (req, res) => {
  const { block, gender, roomsFrom, roomsTo, bedsPerRoom } = req.body;
  if (!block || !gender || !roomsFrom || !roomsTo || !bedsPerRoom) {
    return res.status(400).json({ error: 'block, gender, roomsFrom, roomsTo and bedsPerRoom are required' });
  }

  const newBeds = [];
  for (let room = Number(roomsFrom); room <= Number(roomsTo); room += 1) {
    for (let bedNum = 1; bedNum <= Number(bedsPerRoom); bedNum += 1) {
      newBeds.push({
        id: genId('bed'),
        block,
        gender,
        room,
        bedNum,
        status: 'available',
        occupant: null,
      });
    }
  }
  state.beds.push(...newBeds);
  res.status(201).json(newBeds);
});

app.post('/api/applications', (req, res) => {
  const { matric, name, year, gender, state: applicantState, disability } = req.body;
  if (!matric || !name || !year || !gender) {
    return res.status(400).json({ error: 'matric, name, year and gender are required' });
  }

  const application = {
    id: genId('app'),
    matric,
    name,
    year,
    gender,
    state: applicantState || '',
    disability: disability || 'None',
    status: 'pending',
    allocatedBedId: null,
    submittedAt: new Date().toISOString(),
  };

  state.applications.push(application);
  res.status(201).json(application);
});

app.post('/api/listings', (req, res) => {
  const { title, price, type, distance, landlordId, features } = req.body;
  if (!title || !price || !landlordId) {
    return res.status(400).json({ error: 'title, price, and landlordId are required' });
  }

  const landlord = state.landlords.find((item) => item.id === landlordId);
  const listing = {
    id: genId('listing'),
    title,
    price,
    type: type || 'Unknown',
    distance: distance || '',
    landlordId,
    features: Array.isArray(features) ? features : [],
    status: landlord && landlord.kycStatus === 'verified' ? 'live' : 'pending_verification',
  };

  state.listings.push(listing);
  res.status(201).json(listing);
});

app.post('/api/process-all', (req, res) => {
  const results = state.applications
    .filter((application) => application.status === 'pending')
    .map((application) => ({ applicationId: application.id, result: allocateApplication(application) }));
  res.json(results);
});

app.post('/api/allocate/:id', (req, res) => {
  const application = state.applications.find((item) => item.id === req.params.id);
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }
  if (application.status !== 'pending') {
    return res.status(400).json({ error: 'Application is not pending' });
  }
  const result = allocateApplication(application);
  res.json(result);
});

app.get('/api/transactions', (req, res) => {
  res.json(state.transactions);
});

app.post('/api/transactions', (req, res) => {
  const { name, type, amount } = req.body;
  if (!name || !type || amount == null) {
    return res.status(400).json({ error: 'name, type, and amount are required' });
  }
  const transaction = {
    id: genId('tx'),
    name,
    type,
    amount: Number(amount),
    status: 'in_escrow',
    escrow: 'holding',
    paymentProvider: 'PayStripe',
    paymentStatus: 'succeeded',
    date: new Date().toISOString().slice(0, 10),
  };
  state.transactions.push(transaction);
  res.status(201).json(transaction);
});

app.put('/api/transactions/:id/release', (req, res) => {
  const transaction = state.transactions.find((item) => item.id === req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  transaction.status = 'confirmed';
  transaction.escrow = 'released';
  res.json(transaction);
});

app.put('/api/transactions/:id/dispute', (req, res) => {
  const transaction = state.transactions.find((item) => item.id === req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  transaction.status = 'disputed';
  transaction.escrow = 'frozen';
  res.json(transaction);
});

app.post('/api/paystripe/charge', async (req, res) => {
  const { name, type, amount } = req.body;
  if (!name || !type || amount == null) {
    return res.status(400).json({ error: 'name, type, and amount are required' });
  }

  const amountInKobo = Math.round(Number(amount) * 100);
  if (Number.isNaN(amountInKobo) || amountInKobo <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const transaction = {
    id: genId('tx'),
    name,
    type,
    amount: Number(amount),
    status: 'pending',
    escrow: 'holding',
    paymentProvider: 'PayStripe',
    paymentStatus: 'created',
    date: new Date().toISOString().slice(0, 10),
  };
  state.transactions.push(transaction);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'ngn',
            product_data: {
              name: `${type} payment for ${name}`,
              description: `Payment through Stripe checkout for ${name}`,
            },
            unit_amount: amountInKobo,
          },
          quantity: 1,
        },
      ],
      metadata: {
        transactionId: transaction.id,
        studentName: name,
        paymentType: type,
      },
      success_url: `${frontendUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?canceled=true`,
    });

    res.status(201).json({ sessionId: session.id, transaction });
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    res.status(500).json({ error: 'Failed to create Stripe checkout session' });
  }
});

// Confirm a checkout session immediately (useful after redirect)
app.get('/api/paystripe/confirm', async (req, res) => {
  const sessionId = req.query.sessionId || req.query.session_id;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId query parameter is required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const transactionId = session?.metadata?.transactionId;
    if (transactionId) {
      const transaction = state.transactions.find((t) => t.id === transactionId);
      if (transaction) {
        transaction.status = 'confirmed';
        transaction.paymentStatus = 'succeeded';
      }
      return res.json({ session, transaction });
    }
    res.status(404).json({ error: 'No transaction metadata found on session', session });
  } catch (err) {
    console.error('Failed to retrieve Stripe session:', err);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripeWebhookSecret) {
    return res.status(500).send('Webhook secret not configured');
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).send('Missing Stripe signature');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const transactionId = session.metadata?.transactionId;
    if (transactionId) {
      const transaction = state.transactions.find((item) => item.id === transactionId);
      if (transaction) {
        transaction.status = 'confirmed';
        transaction.paymentStatus = 'succeeded';
      }
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.listen(port, () => {
  console.log(`UniNest FUW backend running at http://localhost:${port}`);
});
