import app from './app';
import { PORT } from './config';

app.listen(PORT, () => {
  console.log(`Product Service is running on port ${PORT}`);
});