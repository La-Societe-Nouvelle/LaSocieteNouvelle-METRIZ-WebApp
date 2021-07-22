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
Il permet également de récupérer la branche d'activité de l'entreprise et d'affecter pour les dépenses non renseignées (Cf. partie *Données financières*) des valeurs par défaut plus appropriées.

L'**année de fin de l'exercice** permettra d'assurer un suivi annuel de la performance de l'entreprise et l'utilisation de la bonne valeur pour estimer les impacts de dépenses passées.

Le tableau présent au sein de la vue correspond à un récapitulatif de l'Empreinte Sociétale de l'Entreprise (valeurs des indicateurs relatives au chiffre d'affaires de l'entreprise).
L'absence de valeur signifie que des données sont manquantes pour le calcul.

&nbsp;
### DONNÉES FINANCIÈRES

La section *Données Financières* correspond à la saisie des données financières de l'entreprise. Elle regroupe quatre onglets :
* *Soldes intermédiaires* pour la saisie des soldes comptables
* *Charges externes* pour la saisie ou l'importation des charges externes
* *Ammortissements sur immobilisations* pour la saisie ou l'importation des dotations aux amortissements
* *Fournisseurs* pour la saisie de fournisseurs supplémentaires

&nbsp;
#### Soldes intermédiaires

Le tableau des agrégats peut être rempli soit via l'import d'un fichier FEC, soit manuellement. Si un fichier FEC est importé, les données du tableau sont toujours éditables. 
À noter que le calcul de l'Empreinte Sociétale ne peut se faire que si, à minima, le chiffre d'affaires est renseigné et les montants totaux des charges externes et des dotations aux amortissements sont disponibles (montant total saisi ou calculé à partir des lignes). Le cas échéant, le montant de la valeur ajoutée nette peut être déduit.

Le chiffre d'affaires (production vendue) est par défaut considéré comme entièrement produit sur l'exercice (ligne production). Le cas non-échéant, il convient de renseigner le volume de production déstockée. Il convient également en cas de production stockée et/ou de production immobilisée de renseigner le volume correspondant.
Pour rappel la production sur un exercice correspond à la somme de la production vendue (chiffre d'affaires), de la production stockée et de la production immobilisée ôtée de la production déstockée.

Le montant total des charges externes (respectivement des dotations aux amortissements) correspond à la somme des montants des charges (respectivement des dotations) saisies ou importées (Cf. onglets *Charges externes* et *Dotations aux amortissements*).

Le cadenas situé à côté des agrégats permet de *bloquer* le montant i.e. de définir le montant total dans le cas où toutes les charges ou dotations ne sont pas renseignées. L'écart sera considéré comme des charges ou dotations *non classées* et des valeurs par défaut seront utilisées pour la mesure des indicateurs. 

&nbsp;
#### Charges externes

Actions globales :
* Importer un fichier FEC : importation d'un fichier FEC (les lignes précédemment saisies sont écrasées lors de l'importation)
* Importer un fichier CSV : importation d'un fichier .csv (les lignes précédemment saisies sont écrasées lors de l'importation)
* Ajouter une dépense : ouvre un formulaire permettant de renseigner les données nécessaires à l'ajout d'une charge dans le tableau. Cette dépense s'ajoutera aux dépenses existantes.
* Supprimer tout : suppression de toutes les lignes

L'import des charges externes peut se faire manuellement (charge par charge) en saisissant le libellé, le montant, le compte et la fournisseurs associé via le bouton *Ajouter une dépense*. Il est également possible d'importer un fichier .csv ou un fichier FEC. 

Le fichier d'import .csv doit comporter une en-tête (*header*) afin d'identifier les différentes colonnes, et avec les libellés suivants, séparés par des point-virgules :
- *corporateId* pour la colonne contenant le numéro siren
- *corporateName* pour la colonne contenant le libellé de l'entreprise
- *account* pour la colonne contenant le numéro de compte associé
- *label* pour la colonne contenant le nom associé à la dépense
- *amount* pour la colonne contenant le montant de la dépense. 

Les données sont modifiables au niveau de chaque ligne, en cliquant sur l'icône *crayon*. Il est également possible de supprimer la ligne en cliquant sur l'icône *poubelle* ou de supprimer toutes les lignes en cliquant sur le bouton *Supprimer tout*.

&nbsp;
#### Amortissements sur immobilisations

Le fonctionnement est similaire à l'onglet *Charges externes*

&nbsp;
#### Fournisseurs

Cette section se met autmatiquement à jour en fonction des données saisies dans les onglets *Charges externes* et *Amortissements sur immobilisations*. Il est possible d'ajouter des fournisseurs via l'import d'un fichier .csv. L'importation écrasera les données précédemment saisies.

Le fichier d'import .csv doit comporter une en-tête (*header*) afin d'identifier les différentes colonnes, et avec les libellés suivants :
- *corporateName* pour la colonne contenant le libellé de l'entreprise
- *corporateId* pour la colonne contenant le numéro siren

La colonne *siren* est de couleur verte pour les entreprises *reconnues*.
Si l'entreprise n'est pas reconnue des valeurs génériques par défaut sont utilisées, il est cependant possible de préciser la situation géographique et la division économique à laquelle est rattachée l'entreprise, ou à laquelle elle se rapproche le plus. Cela permet d'affiner les résultats de l'Empreinte Sociétale de l'Entreprise.

&nbsp;
### INDICATEURS (INFORMATIONS GÉNÉRALES)

Pour chaque indicateur, l'interface se compose de 2 sections :
* La déclaration des impacts directs : zone de saisie des impacts directs. Il est possible, si besoin, d'accéder à un outil de calcul des données.
* Le tableau récapitulatif : tableau regroupant les valeurs intermédiaires pour chaque solde intermédiaire et pour la valeur produite. Il est possible de modifier la valeur proposée et son incertitude pour chaque fournisseur. 

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

Les boutons *Détail des dépenses* et *Détail des ammortissements* renvoient respectivement à la section *Détails des impacts indirects des consommations* et *Détails des impacts indirects des immobilisations*. Il est possible d'y modifier les données par fournisseur si une valeur plus pertinente est connue, pour affiner le résultat du calcul de l'Empreinte Sociétale de l'Entreprise.

&nbsp;
## TÉLÉCHARGER LA SESSION / IMPORTER UN FICHIER

Les données saisies n'étant pas sauvegardées, il est possible de les télécharger pour les importer plus tard dans le but de poursuivre ou vérifier la précédente saisie.
Les fichiers de sauvegarde sont au format JSON.  
Les évolutions de l'application pourront entraîner un écart entre l'état sauvegardé au sein d'un fichier de sauvegarde et l'état utilisé au sein de l'application.
L'importation sera adaptée pour préserver la lisibilité des fichiers. En cas de problème, n'hésitez pas à nous contacter.

&nbsp;
## DOCUMENTATION

Renvoie à cette documentation. N'hésitez pas à nous contacter en cas de problème, ne trouvant pas de réponse ici.
Si vous rencontrez des difficultés à calculer un indicateur, nous proposons un service d'audit. Si vous souhaitez en bénéficier, contactez-nous.

&nbsp;
## CODE SOURCE

Cet outil est open source, ce lien renvoie au code source sur Github. Vous pouvez participer au développement du projet en proposant des améliorations.
