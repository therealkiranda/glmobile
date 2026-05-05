import { registerRootComponent } from 'expo';
import App from './App';

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('GLOBAL ERROR:', error.message, error.stack);
});

registerRootComponent(App);
