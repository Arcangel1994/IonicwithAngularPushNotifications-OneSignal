import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [];

  pushListener = new EventEmitter<OSNotificationPayload>();

  userId: string;

  constructor(private oneSignal: OneSignal, private storage: Storage) {
    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {
    this.oneSignal.startInit('8521271b-812d-436f-9582-6efd2e5a13e1', '442640418246');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
    // do something when notification is received
    console.log('Notificacion recibida ', noti);
    this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe( async (noti) => {
      // do something when a notification is opened
      console.log('Notificacion abierta ', noti);
      await this.notificacionRecibida(noti.notification);
    });

    /*Obtener Id*/
    this.oneSignal.getIds().then( info => {
      this.userId = info.userId;
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification) {

    await this.cargarMensajes();

    const payload = noti.payload;
    // tslint:disable-next-line:no-string-literal
    const existePush = this.mensajes.find(mensaje => mensaje.notificationID === payload.notificationID);

    if (existePush) {
      return;
    }

    this.mensajes.unshift(payload);

    this.pushListener.emit(payload);

    await this.guardarMensajes();
  }

  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes);
  }

  async cargarMensajes() {
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }

  async borrarMensajes() {
    await this.storage.remove('mensajes');
    this.mensajes = [];
    this.guardarMensajes();
  }

}
