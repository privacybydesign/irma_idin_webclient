import $ from 'jquery';
import Cookies from 'js-cookie';
import { showError } from './common.js';

$(function () {
    showError(Cookies.get('error'));
});
