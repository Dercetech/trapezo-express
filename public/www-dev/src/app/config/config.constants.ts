import { InjectionToken } from "@angular/core";
import {AppConfig} from "./config.interface";
import {environment} from "../../environments/environment";

const apiEndpoint = environment.api;

export const APP_DI_CONFIG: AppConfig = {

  API: {
    ROOT: apiEndpoint,
    AUTHENTICATE: apiEndpoint + '/authenticate'
  },

  COLLAPSE_MENU_UNDER: 960,
  MOBILE_DISPLAY_UNDER: 600     // Make sure to also update styles.variables.scss "$MOBILE_DISPLAY_UNDER" constant
};

export let APP_CONFIG = new InjectionToken< AppConfig >( 'app.config' );
