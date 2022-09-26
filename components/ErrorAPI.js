import { Alert } from "react-bootstrap";

export function ErrorApi() {
  return (
    <Alert variant={"error"}>
      API inacessible - Erreur de récupération des données . Nos équipes sont
      mobilisées pour résoudre le problème dans les plus brefs délais.
    </Alert>
  );
}
