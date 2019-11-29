
import { App } from './app';

document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        const app = new App();
    }
}; 