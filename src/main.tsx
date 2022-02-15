import { render } from 'react-dom';
import AppMain from 'src/AppMain';
import 'src/index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<AppMain />, document.getElementById('root')!);
