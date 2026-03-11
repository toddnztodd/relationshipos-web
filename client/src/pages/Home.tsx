// Redirect to Dashboard - Home is now Dashboard
import { Redirect } from 'wouter';

export default function Home() {
  return <Redirect to="/" />;
}
