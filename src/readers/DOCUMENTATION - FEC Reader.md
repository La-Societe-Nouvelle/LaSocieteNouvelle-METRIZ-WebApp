# DOCUMENTATION - FEC READER

Le script de lecture s'effectue sur l'ensemble des écritures présents au sein du fichier. Seule le journal des A-Nouveaux fait l'objet d'une lecture différente.

La description des informations extraites est décrite ci-dessous.

*Note : la terminologie : "écriture relative au comptes x" signifie que le numéro de compte de la ligne d'écriture commence par le numéro x.*


## OBJETS

Les données comptables permettent de construire les objets suivantes :
- Immobilisation
- Stock
- Dépenses
- Dotations aux amortissements sur immobilisations
- Variations de stocks

### Immobilisation

Attributs:
- Numéro du compte
- Libellé du compte
- Montant (valeur comptable) en début d'exercice
- Montant (valeur comptable) en fin d'exercice
- Caractère amortissable

## LECTURE DU JOURNAL A-NOUVEAUX

La lecture du journal des A-Nouveaux permet de connaître les montants en début d'exercice des comptes de stocks et d'immobilisations.


### Ecritures relatives aux comptes d'Immobilisations

Pour chaque écriture relative à un compte d'immobilisation (hors comptes d'amortissements et de dépréciations), sont enregistrées les informations suivantes :
- numéro du compte
- libellé du compte
- caractère amortissable (comptes 20 et 21)
- montant (valeur comptable)*

* Pour les comptes 20 et 21, un compte d'amortissement est recherché au sein du journal. Si existant, le montant enregistré pour l'immobilisation est réduit du montant de l'amortissement.

### Ecritures relatives aux comptes de Stocks

Seuls les comptes 31, 32, 33, 34, 35 et 37 font l'objet d'un traitement.

Pour chaque écriture relative à l'un de ces comptes, sont enregistrées les informations suivantes :
- numéro du compte
- libellé du compte
- Montant initial
- type de stock (achats et marchandises/produits)
- correspondance avec les comptes de charges (pour les comptes 31, 32 et 37)


## AUTRES JOURNAUX

### Ecritures relatives aux comptes d'Immobilisation

Pour les écritures relatives aux comptes 20 à 27, la variation (débit - crédit) est enregistrée au niveau du compte d'immobilisation

________________________________________________________________

Les informations reprises sont les montants nets comptables des comptes d'immobilisations.

Les comptes 20 à 27 font l'objet d'un enregistrement

| Ecriture | Traitement |
| Les écritures relatives à un compte d'immobilisations (2) (hors comptes 28 et 29), le montant au débit est enregistré.

Pour les comptes 20 et 21, un compte d'amortissement 28 est associé. Si le compte est présent dans le journal, le montant au crédit vient réduire le montant de l'immobilisation.

Les comptes 29 ne sont pas pris en comptes. Ils n'ont pas d'incidence sur le résultat d'exploitation de l'entreprise.

Les comptes enregistrées sont les comptes 20 à 27.


La lecture du journal permet la récupération des données suivantes :
- Stock initial d'achats;
- Stock initial de produits;
- Valeur des immobilisations. 

Le stock initial d'achats correspond à la somme des débits des comptes 33, 34 et 35.
Le montant apparaît au sein du tableau des soldes intermédiaires sour la dénomination "Achats déstockés".

Le stock initial de produits correspond quant à lui à la somme des débits des comptes 31, 32 et 37.  
Le montant apparaît au sein du tableau des soldes intermédiaires sous la dénomination "Production déstockée sur l'exercice précédent".

La valeur des immobilisations est obtenue pour chaque compte 20 et 21 à partir des débits des comptes 20 et 21 et des crédits des comptes d'amortissements correspondants. La correspondance se fait suivant le modèle 2xxxx0 <-> 28xxxx.
Les valeurs sont accessibles au sein du tableau "Etat des immobilisations" (Données financières - Onglet Immobilisations).

### Comptes de Stocks

Pour chaque écriture relative à un compte de stock (hors comptes 36, 38 et 39), le montant au débit est enregistré.

Les comptes 31, 32 et 37 sont considérés comme des comptes d'achats i.e. leurs indicateurs sont obtenues à partir des comptes de charges.

Les comptes 33, 34 et 35 sont considérés comme des comptes de produits i.e. leurs indicateurs sont obtenus à partir de l'empreinte de la production de l'entreprise.


## AUTRES JOURNAUX

### ECRITURE - COMPTE D'IMMOBILISATIONS

La lecture des écritures relatives aux immobilisations permet d'obtenir la valeur finale du compte concerné.

La valeur finale permet de produire l'état final des comptes, qui pourra alors être importé lors du prochain exercice.

### ECRITURE - COMPTE DE STOCKS

La lecture des écritures relatives aux stocks permet, à l'image des comtpes d'immobilisations, d'obtenir le montant des stocks en fin d'exercice.

### ECRITURE - COMPTE DE CHARGES

La lecture des écritures relatives aux charges comprend trois cas.

Pour les comptes 60, 61 et 62 hors 603 : enregistrement de la dépense.
Un compte auxiliaire est recherché : compte 40 ayant le même numéro de ligne d'écriture et le même libellé d'écriture.
Si le compte auxiliaire n'est pas disponible, le compte de fournisseur est utilisé, et si celui n'est pas disponible un compte par défaut "DEPENSES - {Compte de charge}" est utilisé.

Les rabais, remises, ristournes sont enregistrés en tant que dépenses négatives pour plus de simplicité.
Elle sont associés aux comptes correspondant 609 => 60_

Pour les comptes 603,
une variattion de stock est enregistrée.

Est-ce que pour un 603 plusieurs 3__

## JOURNAL - VENTES

La lecture du journal des ventes permet l'obtention du chiffre d'affaires. Il est obtenu en faisant la somme des crédits executés sur le compte 70.

## JOURNAL - ACHATS

La lecture du journal des achats permet l'obtention des dépenses d'exploitation et des dépenses en immobilisations.

Pour les dépenses d'exploitation, les comptes considérés sont les comptes 60 (hors 603), 61 et 62. Les dépenses sont associées au fournisseur via les comptes auxiliaires (à partir de ligne relative au compte fournisseur).
La liste des dépenses est ensuite accessible via l'onglet "Charges externes".

Pour les dépenses en immobilisations, les comptes considérés sont les comptes 20 et 21. Les dépenses sont directement associées au compte d'immbolisation concerné.
La liste des dépenses est accessible via l'onglet "Immobilisations" (3ème tableau).


## JOURNAL - AUTRES OPERATIONS

La lecture des journaux correspondants aux autres opérations permet l'acquisition des données suivantes :
- Volume de la production immobilisée
- Stock final de produits
- Stock final d'achats
- Dotations aux amortissements

Le volume de la production immobilisée correspond à la somme des crédits sur le compte 72.

Le stock final de produits est obtenu à partir des débits/crédits sur le compte 71.

Le stock final d'achats est quand à lui obtenur à partir des débits/crédits sur le compte 603.

Les dotations aux amortissements sont obtenus à partir des écritures sur les comptes 28.
La liste des dotations est accessible via l'onglet "Immobilisations" (1er tableau).
