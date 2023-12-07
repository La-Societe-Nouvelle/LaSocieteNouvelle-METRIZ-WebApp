// La Société Nouvelle

// React
import React from "react";
import { Button, Container, Image } from "react-bootstrap";

// utils
import { downloadSession } from "./Utils";

// Components
import { Topbar } from "../components/pageComponents/Topbar";

// Logs
import { saveErrorLog } from "../statReportService/StatReportService";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      session: this.props.session,
      hasError: false,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true });
    const componentStackLines = errorInfo.componentStack.split("\n");
    const componentNameLine = componentStackLines[1];
    if (process.env.NODE_ENV === "production") {
      saveErrorLog(new Date(), componentNameLine, error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <header>
            <Topbar session={this.state.session} />
          </header>
          <Container fluid className="mt-4">
            <section className="step">
              <div className="d-flex  align-items-center justify-content-evenly">
                <Image src="/illus/503.svg" height={600} />
                <div className="">
                  <h1 className="mb-4">Oops ! Un problème est survenu</h1>
                  {this.state.session.progression > 0 && (
                    <p>
                      Pour ne pas perdre vos données d'analyse,{" "}
                      <b>sauvegardez votre session</b>. Vous pourrez reprendre
                      où vous en étiez.
                    </p>
                  )}
                  <p>
                    Nous nous excusons pour ce désagrément et travaillons sur la
                    résolution du problème. <br />
                    Si vous avez des questions ou avez besoin d'aide, n'hésitez
                    pas à{" "}
                    <a
                      href="mailto:support@lasocietenouvelle.org"
                      className="fw-bold text-decoration-underline"
                    >
                      contacter notre support
                    </a>
                    .
                  </p>
                  <div className="mt-4">
                    <a href="/" className="btn btn-primary me-2">
                      Retour à l'accueil
                    </a>

                    {this.state.session.progression > 0 && (
                      <Button
                        variant="secondary"
                        onClick={() => downloadSession(this.state.session)}
                      >
                        Sauvegarder ma session
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </Container>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
