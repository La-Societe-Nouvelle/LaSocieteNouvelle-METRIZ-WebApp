# DOCUMENTATION METRIZ - WEB APPLICATION

METRIZ WebApp est une application web, libre et open source conçue pour fournir une solution de base pour la mesure de l'Empreinte Sociétale d'une Entreprise.

L'application est disponible via l'url : https://metriz.lasocietenouvelle.org

&nbsp;
## INFORMATIONS RELATIVES AUX DONNÉES SAISIES

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
### UNITÉ LÉGALE

Le **numéro de siren** (numéro à 9 chiffres fournit par l'INSEE) est indispensable pour la publication des résultats au sein de la base de données puisqu'il correspond actuellement au numéro d'identification de l'Empreinte Sociétale d'une Entreprise.
Il permet également de récupérer des valeurs comparatives liées à la branche d'activités pour une meilleure appréciation des résultats obtenus.

L'**année de fin de l'exercice** permettra d'assurer un suivi annuel de la performance de l'entreprise et l'utilisation de la bonne valeur pour estimer les impacts de dépenses passées.

&nbsp;
### DONNÉES FINANCIÈRES

La section *Données Financières* correspond à l'importation et à la vérification des données comptables. L'importation s'effectue au format FEC (Fichier d'Ecritures Comptables) 

Les vues disponibles pour le contrôle des données sont :
* *Compte de résultat* avec les soldes intermédiaires de gestion
* *Immobilisations* - Tableau de variations des valeurs nettes comptables des immobilisations
* *Charges externes* - Liste des montants des charges externes par compte de charges
* *Stocks* - Tableau des variations des stocks

Attention: Les charges des comptes #609 sont enregistrées comme des dépenses *négatives* et sont associées au compte de charge lié (ex. #601 pour #6091)

&nbsp;
### FOURNISSEURS

Cette section se met automatiquement à jour à partir des données comptables, et a pour objectif de faire le lien entre les comptes fournisseurs et le numéro de siren de l'entreprise. Il est possible de compléter les numéros de siren l'import d'un fichier .csv ou.xlsx (dont le modèle, pré-rempli, est téléchargeable).

Lorsque les charges ne sont pas rattachées à un compte fournisseur auxiliaire, un compte "DEPENSES - " est créé.

Le fichier d'import .csv doit comporter un en-tête (*header*) avec les libellés suivants, la séparation des données doit se faire avec des points-virgules :
- *corporateName* pour la colonne contenant le libellé de l'entreprise
- *corporateId* pour la colonne contenant le numéro siren

Exemple :

| 1 |corporateName; corporateId |
|:-|:-|
| 2 |Fournisseur1; 012785487 |
| 3 |Fournisseur2; 759647854 |

Le fichier d'import .xlsx doit comporter deux colonnes avec les libellés suivants :
- *identifiant* pour la colonne contenant le numéro siren
- *denomination* pour la colonne contenant le libellé de l'entreprise

Exemple :

| 1 | denomination | siren |
|:--|:-----------|:-------------|
| 2 | Fournisseur1 | 012785487 |
| 3 | Fournisseur2 | 759647854 |


La colonne *siren* est de couleur verte lorsque les données sont synchronisées à partir du numéro de siren. Dès lors qu'elles sont obtenues à partir d'une localisation et d'une division économique, le fond devient vert pour ces deux champs. En l'absence de couleur, aucune donnée n'est associée au fournisseur.

Le bouton *synchroniser les données* permet de mettre à jour les données associées pour l'ensemble des fournisseurs à partir des informations disponibles.

&nbsp;
### ETATS INITIAUX

Cette section a pour objectif de charger les empreintes des comptes de stocks et d'immobilisations en fin d'exercice précédent. En l'absence d'analyse réalisée sur l'exercice précédent, les données peuvent être estimées à partir de l'exercice courant ou à partir de valeurs par défaut.

Dès que des données le permettent, les valeurs sont issues de l'exercice courant.

&nbsp;
### INDICATEURS (INFORMATIONS GÉNÉRALES)

Pour chaque indicateur, l'interface se compose de 2 sections :
* La déclaration des impacts directs : zone de saisie des impacts directs. Il est possible, si besoin, d'accéder à un outil de calcul des données.
* Le tableau récapitulatif : tableau regroupant les valeurs pour chaque solde intermédiaire. 
 
Dans le cas où des valeurs plus pertinentes sont disponibles pour un fournisseur, il est possible de modifier via les tableaux de détails la valeur utilisée et son incertitude. 

&nbsp;
### INDICATEURS (INFORMATIONS SPÉCIFIQUES)

&nbsp;
#### La déclaration des impacts

Cette section permet la déclaration des "impacts directs". La déclaration est propre à chaque indicateur.

Si nécessaire, un outil de calcul de l'impact est mis à disposition via le bouton *Outil de calcul*.

&nbsp;
#### Le tableau récapitulatif

Cette section affiche un tableau récapitulatif des valeurs de l'indicateur pour les différents soldes intermédiaires de gestion.

Il est possible d'exporter un rapport (format PDF) relatif à l'indicateur en cliquant sur *Editer rapport*. Le contenu du rapport est en cours d'évolution, n'hésitez pas à transmettre vos remarques et souhaits.

Les données utilisées sont obtenues à partir des informations saisies (Section "Données Financières") : numéro de siren OU activités et localisation.

Les boutons *Détail des dépenses* et *Détail des ammortissements* renvoient respectivement à la section *Détails des impacts indirects des consommations* et *Détails des impacts indirects des immobilisations*. Il est possible d'y modifier les données par fournisseur si une valeur plus pertinente est connue.

## OUTILS DE MESURE

### CONTRIBUTION A L'EVOLUTION DES COMPETENCES ET DES CONNAISSANCES

L'outil de calcul correspond à une simple décomposition de la contribution directe en 4 items:
* Taxes d'apprentissage et participation des employeurs à la formation professionnelle continue
* Rémunérations de contrats de formation (stage, alternance, etc.)
* Rémunérations liées à des heures de formation
* Rémunérations dans le cadre d'activités de recherche ou de formation

&nbsp;
## TÉLÉCHARGER LA SESSION / IMPORTER UN FICHIER

Les données saisies n'étant pas sauvegardées côté serveur, il est possible de télécharger et d'importer un fichier de sauvegarde.
Les fichiers de sauvegarde sont au format JSON. 
Les évolutions de l'application pourront entraîner un écart entre l'état sauvegardé au sein d'un fichier de sauvegarde et l'état utilisé au sein de l'application.
L'importation sera adaptée pour préserver la lisibilité des fichiers. En cas de problème, n'hésitez pas à nous contacter.

&nbsp;
## DOCUMENTATION

Renvoie à cette documentation. N'hésitez pas à nous contacter en cas de problème ou pour nous faire part de suggestions.

&nbsp;
## CODE SOURCE

Cet outil est open source, ce lien renvoie au code source sur Github. Vous pouvez participer au développement du projet en proposant des améliorations.
