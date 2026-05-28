import Cookies from 'js-cookie';
import { showError } from './common';

document.addEventListener('DOMContentLoaded', () => {
    showError(Cookies.get('error') ?? '');
});
