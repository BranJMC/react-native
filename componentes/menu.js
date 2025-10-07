import React, { Component } from 'react';
import Login from './login';
import Registro from './registrodeestudiante';
import Dashboard from './dashboard';
import TicketsList from './Ticktslist';
import TicketView from './TicketView';

export default class Menu extends Component {
  state = {
    muestraLogin: true,
    muestraregistro: false,
    muestraDashboard: false,
    muestraTickets: false,
    muestraTicketView: false,
    token: "",
    ticketId: null
  };

  navegararegistro = () => {
    this.setState({
      muestraLogin: false,
      muestraregistro: true,
      muestraDashboard: false,
      muestraTickets: false,
      muestraTicketView: false
    });
  };

  navegararlogin = () => {
    this.setState({
      muestraLogin: true,
      muestraregistro: false,
      muestraDashboard: false,
      muestraTickets: false,
      muestraTicketView: false
    });
  };

  navegaradashboard = () => {
    this.setState({
      muestraLogin: false,
      muestraregistro: false,
      muestraDashboard: true,
      muestraTickets: false,
      muestraTicketView: false
    });
  };

  navegaratickets = () => {
    this.setState({
      muestraLogin: false,
      muestraregistro: false,
      muestraDashboard: false,
      muestraTickets: true,
      muestraTicketView: false
    });
  };

  navegaraticketview = (ticketId) => {
    this.setState({
      muestraLogin: false,
      muestraregistro: false,
      muestraDashboard: false,
      muestraTickets: false,
      muestraTicketView: true,
      ticketId
    });
  };

  salir = () => {
    this.setState({
      token: "",
      muestraLogin: true,
      muestraregistro: false,
      muestraDashboard: false,
      muestraTickets: false,
      muestraTicketView: false,
      ticketId: null
    });
  };

  render() {
    if (this.state.muestraLogin) {
      return (
        <Login
          onLoginSuccess={(token) => {
            this.setState({ token });
            this.navegaradashboard();
          }}
          onIrRegistro={this.navegararegistro}
        />
      );
    }
    if (this.state.muestraregistro) {
      return (
        <Registro
          muestralogin={this.navegararlogin}
        />
      );
    }
    if (this.state.muestraDashboard) {
      return (
        <Dashboard
          onVerTickets={this.navegaratickets}
          onSalir={this.salir}
        />
      );
    }
    if (this.state.muestraTickets) {
      return (
        <TicketsList
          onVerTicket={this.navegaraticketview}
          onSalir={this.salir}
          onVolverDashboard={this.navegaradashboard}
        />
      );
    }
    if (this.state.muestraTicketView) {
      return (
        <TicketView
          ticketId={this.state.ticketId}
          onVolverLista={this.navegaratickets}
          onSalir={this.salir}
        />
      );
    }
    return null;
  }
}