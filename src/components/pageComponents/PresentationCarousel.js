import React from "react";
import { Carousel, Col, Row } from "react-bootstrap";

function PresentationCarousel() {
  return (
    <Carousel slide interval={null}>
      <Carousel.Item>
        <h3>Mesurez l'empreinte sociétale de votre entreprise</h3>

        <div className="d-flex align-items-center">
          <div>
            <p>
              Complétez vos données comptables et prenez connaissance des
              impacts de votre activité.
            </p>
            <p>
              Vous pourrez comparer vos résultats avec ceux de votre branche et
              leurs évolutions au regard de trajectoires cibles sectorielles.
            </p>
          </div>
          <img className="d-block" src="/carousel/carousel-1.png" alt="" />
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <h3>12 dimensions sociales et environnementales clés</h3>

        <Row>
          <Col>
            <div className="footprint-box">
              <h4>Empreinte sociale</h4>
              <p>Dont l'indice : </p>
              <ul>
                <li>d'Écart des Rémunérations</li>
                <li>d'Écart des Rémunérations F/H</li>
              </ul>
              <p>Dont la contribution : </p>
              <ul>
                <li>à l'Évolution des compétences et des connaissances</li>
              </ul>
            </div>
            <div className="footprint-box">
              <h4>Création de la valeur</h4>
              <p>Dont la contribution : </p>
              <ul>
                <li>à l'Économie Nationale</li>
                <li>aux Métiers d'Art et aux Savoir-faire</li>
                <li>aux Acteurs d'Intérêt Social</li>
              </ul>
            </div>
          </Col>
          <Col>
            <div className="footprint-box">
              <h4>Empreinte environnementale</h4>
              <p>Dont l'intensité : </p>
              <ul className="mb-2">
                <li>d'Émission de Gaz à effet de serre</li>
                <li>d'Extraction de Matières premières</li>
                <li>de Production de Déchets</li>
                <li>de Consommation d'Énergie</li>
                <li>de Consommation d'Eau</li>
                <li>d'Utilisation de Produits dangereux</li>
              </ul>
            </div>
            <div className="footprint-box">
              <h5>En lien avec les objectifs de développement durable</h5>
              <div>
                <img src="/odd/F-WEB-Goal-05.png" alt="odd icon" height={40} />
                <img src="/odd/F-WEB-Goal-07.png" alt="odd icon" height={40} />
                <img src="/odd/F-WEB-Goal-08.png" alt="odd icon" height={40} />
                <img src="/odd/F-WEB-Goal-09.png" alt="odd icon" height={40} />
                <img src="/odd/F-WEB-Goal-10.png" alt="odd icon" height={40} />
                <img src="/odd/F-WEB-Goal-12.png" alt="odd icon" height={40} />
                <img src="/odd/F-WEB-Goal-13.png" alt="odd icon" height={40} />
                <img src="/odd/F-WEB-Goal-14.png" alt="odd icon" height={40} />
                <img src="/odd/F-WEB-Goal-15.png" alt="odd icon" height={40} />
              </div>
            </div>
          </Col>
        </Row>
      </Carousel.Item>
      <Carousel.Item>
        <h3>Une évaluation sur le périmètre de la production</h3>
        <div className="d-flex align-items-center">
          <img className="d-block" src="/carousel/carousel-3.png" alt="" />

          <ul>
            <li>
              Les impacts de votre valeur ajoutée (impacts directs liés à vos
              opérations)
            </li>
            <li>
              Les impacts liés à vos consommations : intermédiaires et de
              capital fixe
            </li>
          </ul>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <h3>Pour la mesure de vos impacts indirects</h3>
        <div>
          <p className="text-center my-3">
            La mesure de l'empreinte de vos consommations s'appuie sur
            l'empreinte de la production de vos fournisseurs. <br />
            Elles sont disponibles au sein de notre base de données ouverte.*
          </p>
          <img
            className="d-block m-auto"
            src="/carousel/carousel-4.png"
            alt=""
          />
          <p className="small text-end">
            *En l'absence de données publiées, des données statistiques sont
            utilisées.
          </p>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <h3>Pour la mesure de vos impacts directs</h3>
        <p className="text-center  my-3">
          L'empreinte de vos activités est obtenue à partir de données
          d'activité.
        </p>

        <img
          className="d-block m-auto py-5"
          src="/carousel/carousel-5.png"
          alt=""
        />
      </Carousel.Item>
      <Carousel.Item>
        <h3>Etapes au sein de l'application web</h3>
        <img className="d-block m-auto" src="/carousel/carousel-6.png" alt="" />
      </Carousel.Item>
      <Carousel.Item>
        <h3>Les résultats disponibles</h3>
        <div className="d-flex align-items-center">
          <img className="d-block" src="/carousel/carousel-7.png" alt="" />
          <ul>
            <li>
              Empreintes de vos soldes intermédiaires de gestion et de vos
              comptes de charges externes
            </li>
            <li>
              Comparaisons avec votre branche et l'objectif associé pour 2030*
            </li>
            <li>
              Courbes d'évolution : historique, tendance et trajectoires cibles
            </li>
          </ul>
        </div>
        <p className="small">*Lorsqu'un objectif national est défini</p>
      </Carousel.Item>
      <Carousel.Item>
        <h3>Le traitement en local de vos données</h3>
        <div className="d-flex align-items-center">
          <div>
            <p>
              Vos données sont traitées "côté client" par votre navigateur web
              sur votre ordinateur. Vos données ne transitent pas au sein de nos
              serveurs et ne font l'objet d'une collecte.
            </p>
            <p>
              Un fichier de sauvegarde peut être enregistré sur votre ordinateur
              pour reprendre ultérieurement une analyse.
            </p>
          </div>
          <img className="d-block" src="/carousel/carousel-8.png" alt="" />
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <h3>Publication de votre empreinte sociétale</h3>

        <p className="text-center  my-3">
          Enfin, vous pouvez publier au sein de notre base de données ouverte
          pour les valoriser.
        </p>

        <img
          className="d-block m-auto py-4"
          src="/carousel/carousel-9.png"
          alt=""
        />
      </Carousel.Item>
    </Carousel>
  );
}

export default PresentationCarousel;
