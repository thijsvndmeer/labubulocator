import express, { Request, Response } from 'express';

const app = express();
const port = 3001; // Using 3001 to avoid conflict with the frontend dev server

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Labubu Value Tracker backend!');
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
