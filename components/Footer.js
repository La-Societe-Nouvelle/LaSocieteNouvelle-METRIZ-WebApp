// La Societe Nouvelle

// React
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone } from '@fortawesome/free-solid-svg-icons'

export function Footer({step}) {

    const getCurrentYear = () => {
        return new Date().getFullYear();
    };
    let footer = "footer"
    if(step==0){
     footer= "footer-index";
    }
   
    if(step ==0){
        return (
            <footer className={footer + " container-fluid"}>
                <div className="copyright">
                    <p className='font-weight-bold'>&copy; {getCurrentYear()} La Société Nouvelle</p>
                    <ul>
                        <li><a href="#">Mentions légales</a></li>
                        <li><a href="#">Politique des cookies</a></li>
                        <li><a href="#">Politique de confidentialité</a></li>
                    </ul>
                    <p>Design by <a href="#">La quincaillerie</a></p>
                </div>
             
                <div className="cta-call">
                    <h3>Vous avez des questions ?</h3>
                    <p>
                        <a href="#" className={" btn btn-primary"}>Contactez nous </a>
                    </p>
                    <p>- ou -</p>
                    <p className='text-color-light'>
                        appeller maintenant le 
                    </p>
                    <a href="tel:00000000" className='phone-number'>
               
                    <FontAwesomeIcon icon={faPhone}  /> 
    
                         00 00 00 00 00 
                
                    </a>
                  
                </div>
            </footer>
        );
    }
    else{
        return (
            <footer className={footer + " container-fluid"}>
                <div className="copyright">
                    <p className='font-weight-bold'>&copy; {getCurrentYear()} La Société Nouvelle</p>
                    <ul>
                        <li><a href="#">Mentions légales</a></li>
                        <li><a href="#">Politique des cookies</a></li>
                        <li><a href="#">Politique de confidentialité</a></li>
                    </ul>
                    <p>Design by <a href="#">La quincaillerie</a></p>
                </div>
             
       
            </footer>
        );
    }

}