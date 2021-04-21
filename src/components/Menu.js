import React, {Component} from 'react';
import axios from 'axios';
import { AUTH_CONFIG } from '../Config';
import { useTable } from 'react-table';

//const API_URL = 'https://localhost:8243/pizzashack/1.0.0';
const API_URL = 'https://localhost:8243/mycaLocal/1.0.0';


class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menuItems : []
        };
    }
    
    getRefreshToken(){
        return localStorage.getItem("refreshToken") || null;
    }

    logout() {

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem("refreshToken");
    }

    

    componentDidMount () {
        const { getAccessToken } = this.props.auth;

        // Add a request interceptor
        axios.interceptors.request.use(function (config) {
            //const token = store.getState().session.token;
            config.headers.Authorization =  `Bearer ${getAccessToken()}`;

            return config;
        });


       /* axios.interceptors.request.use(function (config) {
            if(typeof config.headers['X-CSRF-TOKEN'] === 'undefined') {
                // add X-CSRF-TOKEN header only if url begins with "/api/" or is on same domain
                if(config.url.substring(0,5) === '/api/' || config.url.indexOf(window.location.hostname) !== -1) {
                    config.headers['X-CSRF-TOKEN'] = 'tok,tok,tok,ken est là?';
                }
            }
        
            return config;
        }); */

        
        //axios.defaults.headers.common['Authorization'] = `Bearer ${getAccessToken()}`;
        
        //const headers = { 'Authorization': `Bearer ${getAccessToken()}`}
        axios.post(`${API_URL}/card/getcardinfo`,{locale: "en_FI"})
            .then(response => this.setState({ menuItems: response.data.data }))
            //.then(response => console.log(response.data.data))
            .catch(error =>{ 
                                if(error.response.status === 401 && this.getRefreshToken() !== null){

                                    var options = {
                                        method: 'POST',
                                        url: 'https://localhost:9444/oauth2/token?grant_type=refresh_token&refresh_token=' +this.getRefreshToken(),
                                        headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + AUTH_CONFIG.encodedclientkeyClientSecret},
                                        data:{}
                                      };
                                      
                                      axios.request(options).then(response => {
                        
                                        // Set the time that the access token will expire at
                                        let expiresAt = (response.data.expires_in * 1000) + new Date().getTime();
                                        this.accessToken = response.data.access_token;
                                        this.refreshToken = response.data.refresh_token;
                                        this.expiresAt = expiresAt;
                                        
                                        localStorage.setItem('accessToken', this.accessToken);
                                        localStorage.setItem('refreshToken', this.refreshToken);
                                        localStorage.setItem('isLoggedIn', 'true');
                                        localStorage.setItem('expiresAt', this.expiresAt);
                                        this.componentDidMount ();
                                        
                                      }).catch(error => {
                                        this.logout();
                                        document.location.href="/";
                                        console.error(error);
                                      });

                                }
                                this.setState({ message: error.message })
        
                            });
                            console.log(this.state);
                            console.log(this.response);
    }

    render() {
        /*return (
            <div className="container">
                <div className="card-columns">
                        {this.state.menuItems === null && <p>Loading menu...</p>}
                        {
                            this.state.menuItems && this.state.menuItems.map(item => (
                                <div key={item.name} class="card">
                                    <div class="card-header">{item.name}</div>
                                    <div class="card-body">
                                        <p class="card-text">{item.description}</p>
                                        <a href="#" class="btn btn-primary">More...</a>
                                    </div>
                                </div>
                            ))
                        }
                </div>
            </div>
        ); */

        return (
            <div className="container">
                {this.state.menuItems === null && <p>Loading menu...</p> }
                {
              <table class="table table-striped table-bordered">
              <thead class="thead-dark">
                <tr>
                    <th> card Number</th>
                    <th> current Status</th>
                </tr>
            </thead>
            <tbody>
            {this.state.menuItems && this.state.menuItems.map(item => (
            <tr>
                    <td> {item.dispalyValue}</td>
                    <td> {item.currentStatus}</td>
                </tr>
              ))
            }
            </tbody>
            </table> 
    }
            </div>
          )
        
    }
}

export default Menu;