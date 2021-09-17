# DESCRIPTION - LECTURE FEC

Le présent document décrit le fonctionnement du script de lecture du fichier FEC.

## INFORMATIONS EXTRAITES

La lecture du FEC a pour objectif de récupérer les éléments suivants :
- Montant du chiffre d'affaires
- Montant de la production immobilisée
- Liste des charges externes (avec comptes auxiliaires associés)
- Montants des comptes de stocks en début et fin d'exercice
- Flux de variations de stocks (avec comptes de stocks associés)
- Montants (comptables) des comptes d'immobilisations en début et fin d'exercice
- Liste des acquisitions (avec comptes d'immobilisations et auxiliaires associés)
- Liste des amortissements (avec comptes d'immobilisations associés)

Ainsi que d'autres données complémentaires, utilisées à des fins de contrôle :
- Montant des autres produits d'exploitation
- Montant des taxes
- Montant des charges personnels
- Montant des autres charges d'exploitation
- Montant des charges financières
- Montant des charges exceptionnelles
- Montant des provisions
- Montant des impôts sur les sociétés


## EXECUTION

Le script de lecture s'effectue sur l'ensemble des écritures présentes au sein du fichier. Seul le journal des A-Nouveaux fait l'objet d'une lecture différente.


## LECTURE DU JOURNAL A-NOUVEAUX

Les informations extraites du journal sont les suivantes:
- Montants des comptes de stocks en début d'exercice
- Montants (comptables) des comptes d'immobilisations en début d'exercice

### Ecritures relatives aux comptes d'Immobilisations

Pour chaque écriture relative à un compte d'immobilisation (hors comptes d'amortissements et de dépréciations) i.e. comptes 20x, 21x, 22x, 23x, 25x, 26x et 27x, sont enregistrées les informations suivantes :
- Numéro du compte
- Libellé du compte
- Caractère amortissable (comptes 20x ou 21x)
- Montant (Pour les comptes 20 et 21, un compte d'amortissement 28x est recherché au sein du journal. Si existant, le montant enregistré pour l'immobilisation est réduit du montant de l'amortissement)

Les comtpes 28x sont traités indirectement lors de la lecture des comptes 20x et 21x.

Les comptes 29x ne sont pas pris en comptes, n'ayant pas d'incidence sur les comptes d'exploitation de l'entreprise.

### Ecritures relatives aux comptes de Stocks

Pour chaque écriture relative à un compte de stocks (hors dépréciations, stocks provenant d'immobilisation et stocks en voie d'acheminement) i.e. comptes 31x, 32x, 33x, 34x, 35x et 37x, sont enregistrées les informations suivantes:
- Numéro du compte
- Libellé du compte
- Montant
- Type de stock (achats et marchandises / produits)  

Et pour les comptes d'achats et de marchandises :
- Préfixe des comptes de charges associés au stock (ex. 311x <-> 6011)

Les comptes 36x et 38x ne sont pas pris en comptes.

Les comptes 39x ne sont pas pris en comptes, n'ayant pas d'incidence sur les comptes d'exploitation de l'entreprise.


## AUTRES JOURNAUX

Les informations extraites des journaux sont les suivantes:
- Montant du chiffre d'affaires
- Montant de la production immobilisée
- Liste des charges externes (avec comptes auxiliaires associés)
- Montants des comptes de stocks en fin d'exercice
- Flux de variations de stocks (avec comptes de stocks associés)
- Montants (comptables) des comptes d'immobilisations en fin d'exercice
- Liste des acquisitions (avec comptes d'immobilisations et auxiliaires associés)
- Liste des amortissements (avec comptes d'immobilisations associés)

Les lignes d'écritures *lues* sont celles relatives aux comptes d'immobilisations 2x, aux comptes de stocks 3x, aux comptes de charges 6x et aux comptes de produits 7x.

*Note : la lecture de certaines lignes peut entraîner une recherche sur d'autres comptes (40x par exemple dans le cas des dépenses) qui ne font cependant pas l'objet d'une lecture spontanée*


### Ecritures relatives aux comptes d'Immobilisation

Pour chaque écriture relative à un compte d'immobilisations i.e. comptes 20x, 21x, 22x, 23x, 25x, 26x, 27x, la variation (Débit - Crédit) est incrémentée au volume courant du compte (initialisé lors de la lecture du journal des A-Nouveaux).

Pour chaque écriture relative à un compte d'amortissements i.e. comptes 28x, la variation (Débit - Crédit) est incrémentée au volume courant du compte d'immobilisation associé (i.e. comptes 20x ou 21x); afin d'obtenir la valeur comptable en fin d'exercice.

Les comptes 29x ne sont pas pris en compte, n'ayant pas d'incidence sur les comptes d'exploitation de l'entreprise.

*Note : lorsque le compte d'immobilisations n'est pas encore répertorié (absent du journal des A-Nouveaux), son montant en début d'exercice est considérée comme nul (égal à 0)*


### Ecritures relatives aux comptes de Stocks

Pour chaque écriture relative à un compte de stocks (comptes 31x, 32x, 33x, 34x, 35x et 37x), la variation (Débit - Crédit) est incrémentée au volume courant du compte (initialisé lors de la lecture du journal des A-Nouveaux).

Les comptes 36x, 38x et 39x ne sont pas pris en compte.

*Note : de même que pour les comptes d'immobilisations, lorsque le compte de stocks n'est pas encore répertorié (absent du journal des A-Nouveaux), son montant en début d'exercice est considérée comme nul (égal à 0)*


### Ecritures relatives aux comptes de Charges

Pour chaque écriture relative aux comptes 60x, 61x et 62x (hors 603x), sont enregistrées les informations suivantes:
- Libellé de l'écriture
- Numéro du compte de charges
- Libellé du compte de charges
- Numéro du compte fournisseur auxiliaire associé*
- Libellé du compte fournisseur auxiliaire associé
- Montant (Pour les comptes 609x, le montant est inversé: Crédit - Débit, pour être traité comme une dépense *négative*)

\* *Le numéro du compte auxiliaire est obtenu à partir de la ligne de l'écriture comptable relative à un compte fournisseur 40x. Lorsqu'aucun compte auxiliaire n'est utilisé, le compte fournisseur 40x est repris; et lorsqu'aucune ligne fournisseur n'est trouvable, un compte fournisseur par défaut est créé à partir du numéro du compte de charges et avec le libellé "DEPENESE - X" où X est le libellé du compte de charges.*

Pour chaque écriture relative aux comptes 603x, sont enregistrées les informations suivantes:
- Numéro du compte
- Libellé du compte
- Numéro du compte de stocks associé
- Type de compte de stocks concerné (achats et marchandises)
- Montant

Lorsque le compte 603x est d'ores-et-déjà présent au sein de la liste des variations de stocks, la variation (Débit - Crédit) est incrémentée au montant courant de la variation de stocks.

Pour chaque écriture relative aux comptes 6811x, sont enregistrées les informations suivantes:
- Numéro du compte
- Libellé du compte
- Numéro du compte d'immobilisation associé*
- Montant**

\* *Le numéro du compte d'immobilisation est obtenu à partir de la ligne de l'écriture comptable relative au compte d'amortissement 28x. Si plusieurs comptes d'amortissements, chaque compte fait l'objet d'un enregistrement*

\** *Le montant enregistré est celui de la ligne relative au compte d'amortissement 28x, afin de prendre en compte le cas de figure où plusieurs comptes d'amortissements sont concernés par la dotation.*

Pour les autres écritures relatives à un compte de charges (63x, 64x, 65x, 66x et 686x, 67x et 687x, 681x hors 6811x, 69x), la variation (Débit - Crédit) est incrémentée au montant courant de l'agrégat correspondant (taxes, charges de personnel, etc.).

### Ecritures relatives aux comptes de Produits

Pour chaque écriture relative à un compte de vente de produits 70x, la variation (Débit - Crédit) est incrémentée au volume courant du chiffre d'affaires.

Pour chaque écriture relative à un compte de stocks de produits 71x, sont enregistrées les informations suivantes:
- Numéro du compte
- Libellé du compte
- Numéro du compte de stocks associé
- Type de compte de stocks concerné (produits)
- Montant

Lorsque le compte 71x est d'ores-et-déjà présent au sein de la liste des variations de stocks, la variation (Débit - Crédit) est incrémentée au montant courant de la variation de stocks.

Pour chaque écriture relative à un compte de production immobilisée 72x, la variation (Débit - Crédit) est incrémentée au volume courant de la production immobilisée.

Pour les autres écritures relatives à un compte de produits d'exploitation (74x, 75x, 781x, 791x), la variation (Débit - Crédit) est incrémentée au montant courant de l'agrégat "autres produits d'exploitations".


## AUTRES INFORMATIONS EXTRAITES

La lecture du FEC permet également d'extraire les montants des taxes d'apprentissage et des contributions des employeurs à la formation professionnelle, utilisés pour l'indicateur relatif à l'évolution des compétences et des connaissances.


