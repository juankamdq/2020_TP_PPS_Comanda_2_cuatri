import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { Usuario } from 'src/app/classes/usuario.class';
import { PedidoInterface } from 'src/app/models/pedido.interface';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { PedidosService } from 'src/app/services/coleccion/pedidos.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-tomar-pedido',
  templateUrl: './tomar-pedido.page.html',
  styleUrls: ['./tomar-pedido.page.scss'],
})
export class TomarPedidoPage implements OnInit {

  usuario: UsuarioModel = new Usuario();
  pedidos: PedidoInterface[];
  estado = '';
  tarea = '';

  jsonAsignar = {
    estado: '',
  };

  asignar = '';
  public cont = 0;
  constructor(private pedido: PedidosService,
              private router: Router,
              private toast: ToastService) {


    this.usuario = JSON.parse(localStorage.getItem('userCatch')) as UsuarioModel;
    this.verificarAcceso('mozo', 'bartender', 'cocinero')
      .then( res => {
        setInterval( () => {
           this.traerPedidos();
           this.asignarTareas();
        }, 500);


      })
      /* .catch( rej => rej && this.router.navigateByUrl('/home')) */;

      // tslint:disable-next-line: no-trailing-whitespace

  }

  ngOnInit() {
  }




   traerPedidos(){

   this.pedido.traerPedidos()
      .then( (res: PedidoInterface[]) => {

        this.pedidos = res;
      });
  }

  verificarAcceso( ...usuario ){
    const usuariosAcces = [...usuario];
    return new Promise( (resolve, reject) => {

      for (let i = 0; i < usuariosAcces.length; i++){
        if (usuariosAcces[i] === this.usuario.perfil.toString()){
          resolve(true);
          console.log(`Bienvenido ${usuariosAcces[i]}`);
          i = usuariosAcces.length;
        }

      }
    });
  }


  asignarTareas(pedido?: PedidoInterface){

      this.estado = '';

      switch (this.usuario.perfil.toString()) {

        //////////////// Mozo ///////////////////////////
      case 'mozo':
      if (pedido){
        if (pedido.estado == 'informar'){
          this.estado = 'informar';
          return this.estado;
        }
        if (pedido.estado == 'preparado'){
          this.estado = 'preparado';
          return this.estado;
        }

      }
      this.tarea = 'Llevar comanda';

      break;
      //////////////// Bartender ///////////////////////////
      case 'bartender':
        if (pedido){
          this.estado = 'prepararB';
          return this.estado;
        }
        this.tarea = 'Tragos a preparar';
        break;
        //////////////// Cocinero ///////////////////////////
        case 'cocinero':

        if (pedido){
          this.estado = 'prepararC';
          return this.estado;
        }
        this.tarea = 'Platos a Preparar';
        break;
        default:
        console.log('Error');
    }


  }

  asignarNotificacion(pedido: PedidoInterface){

    switch (this.usuario.perfil.toString()) {

      //////////////// Mozo ///////////////////////////
    case 'mozo':

    if (pedido.estado == 'informar'){
      if (pedido.para == 'cocina'){
        this.jsonAsignar.estado =  'prepararC';
      }
      if (pedido.para == 'bartender'){
        this.jsonAsignar.estado =  'prepararB';
      }

    }
    if (pedido.estado == 'preparado'){
      this.jsonAsignar.estado = 'entregado';
    }

    break;
    //////////////// Bartender y Cocinero ///////////////////////////
    case 'bartender' || 'cocinero':
    this.jsonAsignar.estado = 'preparado';

    break;
    default:
    console.log('Error');
  }

  }

  notificar(pedido: PedidoInterface){
    this.asignarNotificacion(pedido);

    this.pedido.notificarComand(pedido, this.jsonAsignar)
      .then( res => {
        if (res){
          if (pedido.tipo != 'preparado'){
            this.toast.MostrarMensaje(`El area ${pedido.para} fue notificada`, false);
          }
        }
      });
    }



}
