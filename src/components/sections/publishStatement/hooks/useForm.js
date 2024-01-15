import { useState } from 'react';

export const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});

  const handleFormChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });

    setFormErrors({
      ...formErrors,
      [fieldName]: '',
    });
  };

  
  const handleCheckIndicator = (indicator) => {
    setFormErrors({
      ...formErrors,
      footprint: "",
    });

    setFormData((prevData) => ({
      ...prevData,
      footprint: {
        ...prevData.footprint,
        [indicator]: {
          ...prevData.footprint[indicator],
          toPublish: !prevData.footprint[indicator]?.toPublish,
        },
      },
    }));
  };

  const validateForm = async () => {
    const newErrors = {};
    if (
      !Object.values(formData.footprint).some(
        (indicator) => indicator && indicator.toPublish === true
      )
    ) {
      newErrors.footprint = "Sélectionnez au moins un indicateur à publier.";
    }

    if (!/^[0-9]{9}$/.test(formData.siren)) {
      newErrors.siren = "Numero de SIREN incorrect.";
    }

    if (formData.declarant.trim() === "") {
      newErrors.declarant = "Veuillez saisir le nom et prénom du déclarant.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.email.trim() === "" || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Veuillez saisir une adresse e-mail valide.";
    }

    
    if (!formData.autorisation) {
      newErrors.autorisation =
        "Vous devez certifier être autorisé(e) à soumettre la déclaration.";
    }
    if (
      formData.forThirdParty &&
      formData.declarantOrganisation.trim() === ""
    ) {
      newErrors.declarantOrganisation =
        "Veuillez saisir la structure déclarante.";
    }
    setFormErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return {
    formData,
    formErrors,
    handleFormChange,
    handleCheckIndicator,
    setFormErrors,
    validateForm
  };
};
