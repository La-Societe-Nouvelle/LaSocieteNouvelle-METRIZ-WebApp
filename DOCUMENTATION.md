# DOCUMENTATION METRIZ - WEB APPLICATION

METRIZ WebApp est une application web, libre et open source conçue pour fournir une solution de base pour la mesure de l'Empreinte Sociétale d'une Entreprise.

L'application est disponible via l'url : https://metriz.lasocietenouvelle.org

&nbsp;
## INFORMATIONS RELATIVES AUX DONNEES SAISIES

Les données saisies lors d'une session (utilisation de l'application) restent côté client, au sein de la page web.

Ceci implique une *remise à zéro* des valeurs en cas de rafraîchissement (F5) de la page.
Il est cependant possible d'exporter et d'importer un fichier de sauvegarde (format JSON) afin d'enregistrer en local la session en cours et de la poursuivre ultèrieurement.

Aucune information ne passe ainsi par nos serveurs afin d'éviter tout risque concernant la gestion et la protection de vos informations.

Les seules requêtes émises par l'application concernent l'API La Société Nouvelle et visent à récupérer les empreinte sociétales d'entreprises. 
L'origine et le contenu de ces requêtes ne font pas (et ne feront jamais) l'objet d'un enregistrement. 
Seul un comptage global du nombre de requêtes reçues par l'API est effectué dans un objectif de suivi du niveau de sollicitations de l'API.

Les codes sources de l'application web et de l'API sont disponibles pour une complète transparence :  
- Code source de l'applicatio web : https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp
- Code source de l'API La Société Nouvelle : https://github.com/SylvainH-LSN/LaSocieteNouvelle-API
  
&nbsp;
## NOTICE D'UTILISATION

La Notice d'utilisation est organisée selon le menu de navigation (à gauche).

&nbsp;
### UNITE LEGALE

Le **numéro de siren** (numéro à 9 chiffres fournit par l'INSEE) est indispensable pour la publication des résultats au sein de la base de données puisqu'il correspond actuellement au numéro d'identification de l'Empreinte Sociétale d'une Entreprise.
Il permet également de récupérer la branche d'activités de l'entreprise et d'affecter pour les dépenses non renseignées (Cf. partie *Données financières*) des valeurs par défaut plus appropriées.

L'**année de fin de l'exercice** permettra d'assurer un suivi annuel de la performance de l'entreprise et l'utilisation de la bonne valeur pour estimer les impacts de dépenses passées.

Le tableau présent au sein de la vue correspond à un récapitulatif de l'Empreinte Sociétale de l'Entreprise (valeurs des indicateurs relatives au chiffre d'affaires de l'entreprise).
L'absence de valeur signifie que des données sont manquantes pour le calcul.

&nbsp;
### DONNEES FINANCIERES

La section *Données Financières* correspond à la saisie des données financières de l'entreprise. Elle regroupe trois onglets :
* *Soldes intermédiaires* pour la saisie des soldes comptables
* *Charges externes* pour la saisie ou l'importation des charges externes
* *Dotations aux amortissements* pour la saisie ou l'importation des dotations aux amortissements

&nbsp;
#### Soldes intermédiaires

Le calcul de l'Empreinte Sociétale ne peut se faire que si, a minima, le chiffre d'affaires est renseigné et les montants totaux des charges externes et des dotations aux amortissements sont disponibles (montant total saisie ou calculé à partir des lignes). Le cas échéant, le montant de la valeur ajoutée nette peut être déduit.

Le chiffre d'affaires (porduction vendue) est par défaut considéré comme de entièrement produit sur l'exercice (ligne production). Le cas non-échéant, il convient de renseigner le volume de production déstockée. Il convient également en cas de production stockée et/ou de production immobilisée de renseigner le volume correspondant.
Pour rappel la production sur un exercice correspond à la somme de la production vendue (chiffre d'affaires), de la production stockée et de la production immobilisée ôtée de la production déstockée.

Le montant total des charges externes (respectivement des dotations aux amortissements) correspond à la somme des montants des charges (respectivement des dotations) saisies ou importées (Cf. onglets *Charges externes* et *Dotations aux amortissements*).

Les cases à cocher situer à droite permettent de *bloquer* le montant i.e. de définir le montant total dans le cas où toutes les charges ou dotations ne sont pas renseignées. L'écart sera considéré comme des charges ou dotations *inconnues* et des valeurs par défaut seront utilisées pour la mesure des indicateurs.La case est automatiquement décochée si la somme des charges externes ou des dotations dépassent la valeur préalablement fixée.

&nbsp;
#### Charges externes

L'import des charges externes peut se faire manuellement (fournisseur par fournisseur) en saisissant son numéro de siren et le montant associé. Il est également possible d'importer un fichier .csv (séparation point-virgule). 

Le fichier d'import doit alors comporter un en-tête (*header*) ainf d'identifier les différentes colonnes, et avec les libellés suivants :
- *company_id* pour la colonne contenant le numéro siren
- *company_name* pour la colonne contenant le libellé de l'entreprise
- *amount* pour la colonne contenant le montant.

Les données sont modifiables au niveau de chaque ligne. Il est également possible de resynchroniser les données ou de supprimer la ligne.

La colonne *siren* est de couleur verte pour les entreprises *reconnues*.
Si l'entreprise n'est pas reconnue des valeurs génériques par défaut sont utilisées, il est cependant possible de préciser la situation géographique et la division économique à laquelle est rattachée l'entreprise, ou à laquelle elle se rapproche le plus.

Actions globales :
* Importer : importation d'un fichier .csv (les lignes importées s'ajoutent à celles existantes)
* Synchroniser tout : mettre à jour l'ensemble des données à partir des numéros siren
* Supprimer tout : supprimer toutes les lignes

&nbsp;
#### Dotations aux amortissements

Le fonctionnement est similaire à l'onglet *Charges externes*

&nbsp;
### INDICATEURS (INFORMATIONS GENERALES)

Pour chaque indicateur, l'interface se compose de 4 onglets :
* Onglet récapitulatif : valeurs intermédiaires pour chaque solde intermédiaire et pour la valeur produite
* Onglet *Valeur Ajoutée Nette* : onglet pour la saisie des impacts directs
* Onglet *Charges externes* : onglet affichant les valeurs pour chaque entreprise. Il est possible de modifier la valeur proposée et son incertitude.
* Onglet *Dotations aux Amortissements* : onglet affichant les valeurs pour chaque entreprise. Il est possible de modifier la valeur proposée et son incertitude.

&nbsp;
### INDICATEURS (INFORMATIONS SPECIFIQUES)

&nbsp;
#### Soldes intermédiaires

L'onglet "Soldes intermédiaires" affiche un tableau récapitulatif des valeurs de l'indicateur pour les différents soldes intermédiaires de gestion.

Il est possible d'exporter un rapport (format PDF) relatif à l'indicateur. Le contenu du rapport est en cours d'évolution, n'hésitez pas à transmettre vos remarques et souhaits.

&nbsp;
#### Impacts directs - Valeur Ajoutée

L'onglet permet la déclaration des "impacts directs". La déclaration est propre à chaque indicateur.

&nbsp;
#### Impacts indirects - Consommations

L'onglet affiche le détails des valeurs pour chaque consommation.

Les données utilisées sont obtenues à partir des informations saisies (Section "Données Financières") : numéro de siren OU activités et localisation.
Il est possible de modifier les données proposées si une valeur plus pertinente est connue.

&nbsp;
#### Impacts indirects - Immobilisations

L'onglet affiche le détails des valeurs pour chaque dotation aux amortissements.

De même que pour les consommations, les données utilisées sont obtenues à partir des informations saisies (Section "Données Financières") : numéro de siren OU activités et localisation.
Il est possible de modifier les données proposées si une valeur plus pertinente est connue.

&nbsp;
## FICHIERS DE SAUVEGARDE

Les fichiers de sauvegarde sont au format JSON.  
Les évolutions de l'application pourront entraîner un écart entre l'état sauvegardé au sein d'un fichier de sauvegarde et l'état utilisé au sein de l'application.
L'importation sera adaptée pour préserver la lisibilité des fichiers. En cas de problème, n'hésitez pas à nous contacter.
