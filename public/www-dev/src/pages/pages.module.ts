import {NgModule} from "@angular/core";
import {LoginComponent} from "./public/login/login.component";
import {CustomMaterialModule} from "../commons/widgets/material/material.module";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FlexLayoutModule} from "@angular/flex-layout";
import {AngularFontAwesomeModule} from "angular-font-awesome";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonComponentsModule} from "../commons/common-components.module";

@NgModule({
  declarations:[
    LoginComponent
  ],
  imports:[
    BrowserModule,

    // Core extensions
    HttpClientModule,

    // Material
    BrowserAnimationsModule,
    CustomMaterialModule,

    // Angular flex layout
    FlexLayoutModule,

    // Fonts
    AngularFontAwesomeModule,

    // Forms
    FormsModule,
    ReactiveFormsModule,

    // Common components
    CommonComponentsModule

  ],
  exports:[
    LoginComponent
  ]
})

export class PagesModule{}
