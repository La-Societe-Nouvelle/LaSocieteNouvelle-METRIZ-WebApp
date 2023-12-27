import { Form, Row, Col } from "react-bootstrap";

const DeclarantForm = ({ formData, setFormData, errors }) => {
  const handleChange = (e, name) => {
    const { value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData(name, fieldValue);
  };

  return (
    <div className="border border-2 rounded px-3 py-4">
      <Row>
        <Col lg="4">
          <Form.Group as={Row} className="mb-2">
            <Form.Label column sm={6}>
              SIREN
            </Form.Label>
            <Col sm={6}>
              <Form.Control
                type="text"
                value={formData.siren}
                isInvalid={errors.siren}
                onChange={(e) => handleChange(e, "siren")}
                size="sm"
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.siren}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-2">
            <Form.Label column sm={6}>
              Nom - Prénom{" "}
            </Form.Label>
            <Col sm={6}>
              <Form.Control
                type="text"
                size="sm"
                value={formData.declarant}
                isInvalid={errors.declarant}
                onChange={(e) => handleChange(e, "declarant")}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.declarant}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-2">
            <Form.Label column sm={6}>
              Adresse e-mail
            </Form.Label>
            <Col sm={6}>
              <Form.Control
                type="text"
                size="sm"
                value={formData.email}
                isInvalid={errors.email}
                onChange={(e) => handleChange(e, "email")}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
          <Form.Group className="d-flex justify-content-end fw-bold my-3">
            <Form.Check
              type="checkbox"
              id="thirdParty"
              checked={formData.forThirdParty}
              onChange={(e) => handleChange(e, "forThirdParty")}
              label="Déclaration effectuée pour un tiers"
            />
          </Form.Group>

          {formData.forThirdParty && (
            <Form.Group as={Row} className="mb-2">
              <Form.Label column sm={6}>
                Structure déclarante
              </Form.Label>
              <Col sm={6}>
                <Form.Control
                  type="text"
                  size="sm"
                  value={formData.declarantOrganisation}
                  isInvalid={errors.declarantOrganisation}
                  onChange={(e) => handleChange(e, "declarantOrganisation")}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.declarantOrganisation}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>
          )}
        </Col>

        <Col>
      
            <Form.Label>Coût de la formalité*</Form.Label>
            <Form.Check
              type="radio"
              id="price-0"
              value="0"
              checked={formData.price === "0"}
              onChange={(e) => handleChange(e, "price")}
              label="Première déclaration : publication offerte"
            />

            <Form.Check
              type="radio"
              id="price-10"
              value="10"
              checked={formData.price === "10"}
              onChange={(e) => handleChange(e, "price")}
              label="Organise à but non lucratif : 10 €"
            />

            <Form.Check
              type="radio"
              id="price-25"
              value="25"
              checked={formData.price === "25"}
              onChange={(e) => handleChange(e, "price")}
              label="Société unipersonnelle : 25 €"
            />

            <Form.Check
              type="radio"
              id="price-50"
              value="50"
              checked={formData.price === "50"}
              onChange={(e) => handleChange(e, "price")}
              label="Société : 50 €"
            />
            <p className="small fst-italic mt-3">
              * Les revenus couvrent la réalisation des formalités, ainsi que
              les frais d'hébergement et de maintenance pour l'accessibilité des
              données.
            </p>
     
        </Col>
      </Row>
    </div>
  );
};

export default DeclarantForm;
