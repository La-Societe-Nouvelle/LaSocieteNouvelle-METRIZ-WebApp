# DESCRIPTION - LECTURE FEC

Le présent document décrit le fonctionnement du script de lecture du fichier FEC.

## INFORMATIONS EXTRAITES

La lecture du FEC a pour objectif de récupérer les éléments suivants :
- Montant du chiffre d'affaires
- Montant de la production stockée
- Montant de la production immobilisée
- Liste des charges externes (avec comptes fournisseurs auxiliaires associés)
- Variations de stocks (avec comptes de stocks associés)
- Montants des comptes de stocks en début et fin d'exercice
- Montants des comptes d'immobilisations en début et fin d'exercice
- Montants des comptes de dépréciations en début et fin d'exercice (avec comptes d'immobilisations associés)
- Liste des acquisitions (avec comptes d'immobilisations et comptes fournisseurs auxiliaires associés)
- Montants des comptes d'amortissements (avec comptes d'immobilisations associés)
- Liste des dotations aux amortissements sur immobilisations (avec comptes d'amortissements associés)

Ainsi que d'autres données complémentaires, utilisées à des fins de contrôle :
- Montant des autres produits d'exploitation
- Montant des taxes
- Montant des charges personnels
- Montant des autres charges d'exploitation
- Montant des produits financiers
- Montant des charges financières
- Montant des produits exceptionnels
- Montant des charges exceptionnelles
- Montant des provisions
- Montant des impôts sur les sociétés


## EXECUTION

Le script de lecture s'effectue sur l'ensemble des écritures présentes au sein du fichier. Seul le journal des A-Nouveaux fait l'objet d'une lecture spécifique.


## LECTURE DU JOURNAL A-NOUVEAUX

Les informations extraites du journal sont les suivantes:
- Montants des comptes de stocks en début d'exercice
- Montants des comptes d'immobilisations en début d'exercice
- Montants des comptes d'amortissements et de dépréciations en début d'exercice (comptes de stocks et d'immobilisations)

### Ecritures relatives aux comptes d'Immobilisations

Pour chaque écriture relative à un compte d'immobilisation (hors comptes d'amortissements et de dépréciations) i.e. comptes #20, #21, #22, #23, #25, #26 et #27, sont enregistrées les informations suivantes :
- Numéro du compte
- Libellé du compte
- Caractère amortissable (comptes #20, #21)
- Montant

Pour chaque écriture relative à un compte d'amortissements ou de dépréciations i.e. #28 et #29, sont enregistrées les informations suivantes :
- Numéro du compte
- Libellé du compte
- Numéro du compte d'immobilisation associé
- Montant


### Ecritures relatives aux comptes de Stocks

Pour chaque écriture relative à un compte de stocks (hors dépréciations, stocks provenant d'immobilisation et stocks en voie d'acheminement) i.e. comptes #31, #32, #33, #34, #35 et #37, sont enregistrées les informations suivantes:
- Numéro du compte
- Libellé du compte
- Montant
- Type de stock (achats et marchandises / produits)  

Et pour les comptes d'achats et de marchandises :
- Préfixe des comptes de charges associés au stock (ex. #311 <-> #6011)

Les comptes #36 et #38 ne sont pas intégrés au calcul de l'empreinte sociétale.

Pour chaque écriture relative à un compte d'amortissements ou de dépréciations i.e. #39, sont enregistrées les informations suivantes :
- Numéro du compte
- Libellé du compte
- Numéro du compte d'immobilisation associé
- Montant

Les dépréciations des stocks n'interviennent que pour l'affichage du tableau des stocks (onglet *Données financières*) pour l'obtention des valeurs nettes.

## LECTURE DES AUTRES JOURNAUX

Les informations extraites des journaux sont les suivantes:
- Montant du chiffre d'affaires
- Montant de la production stockée
- Montant de la production immobilisée
- Liste des charges externes (avec comptes auxiliaires associés)
- Montants des comptes de stocks en fin d'exercice
- Variations des stocks (avec comptes de stocks associés)
- Montants des comptes d'immobilisations en fin d'exercice
- Montants des comptes d'amortissements et de dépréciations des stocks et des immobilisations en fin d'exercice
- Liste des acquisitions (avec comptes d'immobilisations et auxiliaires associés)
- Liste des dotations aux amortissements sur immobilisations (avec comptes d'immobilisations associés)
Ainsi que les données supplémentaires (cf. ci-dessus).

Les lignes d'écritures *lues* sont celles relatives aux comptes d'immobilisations #2, aux comptes de stocks #3, aux comptes de charges #6 et aux comptes de produits #7.

*Note : la lecture de certaines lignes peut entraîner une recherche sur d'autres comptes (#40 par exemple dans le cas des dépenses) qui ne font cependant pas l'objet d'une lecture spontanée*


### Ecritures relatives aux comptes d'immobilisation

Pour chaque écriture relative à un compte d'immobilisations i.e. comptes #20, #21, #22, #23, #25, #26, #27, la variation (Débit - Crédit) est incrémentée au volume courant du compte (initialisé lors de la lecture du journal des A-Nouveaux).

Lorsque l'écriture fait intervenir un compte fournisseur #40, une acquisition est enregistrée avec les informations suivantes:
- Libellé de l'écriture
- Numéro du compte d'immobilisations
- Libellé du compte d'immobilisations
- Numéro du compte fournisseur auxiliaire associé*
- Libellé du compte fournisseur auxiliaire associé
- Montant

Lorsque l'écriture fait intervenir un compte de production immobilisée, une immobilisation de production est enregistrée avec les informations suivantes :
- Libellé de l'écriture
- Numéro du compte d'immobilisations
- Libellé du compte d'immobilisations
- Numéro du compte de production immobilisée
- Libellé du compte de production immobilisée
- Montant

Pour chaque écriture relative à un comtpe d'amortissement ou de déprécation d'un compte d'immobilisations #28 ou #29, la variation (Crédit - Débit) est incrémentée au montant courant du compte d'amortissement ou de dépréciation.

*Note : lorsque le compte d'immobilisations, d'amortissements ou de dépréciation n'est pas encore répertorié (absent du journal des A-Nouveaux), son montant en début d'exercice est considérée comme nul (égal à 0)*

\* *Lorsqu'aucun compte auxiliaire n'est utilisé, un compte fournisseur par défaut est créé à partir du numéro du compte d'immobilisations et avec le libellé "ACQUISTIONS - X" où X est le libellé du compte d'immobilisations.*


### Ecritures relatives aux comptes de stocks

Pour chaque écriture relative à un compte de stocks (comptes #31, #32, #33, #34, #35, #37), la variation (Débit - Crédit) est incrémentée au volume courant du compte (initialisé lors de la lecture du journal des A-Nouveaux).

Les comptes #36 et #38 ne sont actuellement pas pris en compte.

Pour chaque écriture relative à une dépréciation de stock (comptes #39), la variation (Crédit - Débit) est incrémentée au montant courant du compte de dépréciation.

*Note : lorsque le compte n'est pas encore répertorié, il est initialisé et son montant en début d'exercice est considérée comme nul (égal à 0)*


### Ecritures relatives aux comptes de charges

Pour chaque écriture relative aux comptes #60, #61 et #62 (hors #603), sont enregistrées les informations suivantes:
- Libellé de l'écriture
- Numéro du compte de charges
- Libellé du compte de charges
- Numéro du compte fournisseur auxiliaire associé*
- Libellé du compte fournisseur auxiliaire associé
- Montant

\* *Le numéro du compte auxiliaire est obtenu à partir de la ligne de l'écriture comptable relative à un compte fournisseur #40. Lorsqu'aucun compte auxiliaire n'est utilisé ou lorsqu'aucune ligne fournisseur n'est trouvable, un compte fournisseur par défaut est créé à partir du numéro du compte de charges et avec le libellé "DEPENESE - X" où X est le libellé du compte de charges.*

Pour chaque écriture relative aux comptes #603, sont enregistrées les informations suivantes:
- Numéro du compte
- Libellé du compte
- Numéro du compte de stocks associé #3
- Type de compte de stocks concerné (achats et marchandises)
- Montant

Lorsque une variation concernant les deux comptes (compte de variation et compte de stock) est d'ores-et-déjà présente au sein de la liste des variations de stocks, la variation (Débit - Crédit) est incrémentée au montant courant de la variation existant.

Dans le cas où la variation de stocks concernent plusieurs comptes de stocks :
- Si la lecture des lignes permet d'obtenir un équilibre, la variation est ventilée pour chaque compte de stock
- Si la lecture des lignes ne permet pas d'obtenir un équilibre, une erreur est levée
Dans le cas où que plusieurs variations de stocks avec le même numéro de compte #603 sont présentes dans la même écriture comptable, une erreur est également levée.
Un traitement de regroupement est en cours de développement.

Pour chaque écriture relative aux comptes #6811 et #6871 (dotations aux amortissements sur immobilisations), sont enregistrées les informations suivantes:
- Numéro du compte
- Libellé du compte
- Numéro du compte d'immobilisation associé*
- Montant**

Lorsque une dotation concernant les deux comptes (compte de dotation #68 et compte d'amortissement #28) est d'ores-et-déjà présente au sein de la liste des dotations, la variation (Débit - Crédit) est incrémentée au montant courant de la dotation existante.

Du fait de la présence potentielle de plusieurs numéros de comptes de dotations aux amortissements et de comptes d'amortissements au sein de la même écriture comptable, les situations permettant une lecture complète sont les suivants :
- Unique compte d'amortissements au sein de l'écriture comptable
- Unique compte de dotations et équilibre entre les débits/crédits du compte de dotations et des comptes d'amortissements
Si l'écriture ne correspond pas à une de ces deux situations, des conditions supplémentaires de filtrage sont testées pour réaliser des groupements :
- filtrage par type d'immobilisations (corporelles/incorporelles) 
- filtrage par libellé d'écriture
- décomposition de l'écriture par groupe équilibré (balance débit/crédit)

Dans le cas où la dotation concernent plusieurs comptes d'amortissements :
- Si la lecture des lignes permet d'obtenir un équilibre, la dotation est ventilée pour chaque compte d'amortissement
- Si la lecture des lignes ne permet pas d'obtenir un équilibre, une erreur est levée
Dans le cas où que plusieurs dotations avec le même numéro de compte #68 sont présentes dans la même écriture comptable, et que lecture permet d'obtenir un équilibre, les dotations sont fusionnées (même compte de dotation) et ventilées par compte d'amortissement. Les autres dotations de l'écriture comptable sont ignorées pour éviter un double comptage. Si plusieurs comptes de dotations interviennent, une erreur est levée.

\* *Le numéro du compte d'amortissement est obtenu à partir de la ligne de l'écriture comptable relative au compte d'amortissement #28.*

\*\* *Le montant enregistré est celui de la ligne relative au compte d'amortissements #28, afin de prendre en compte le cas de figure où plusieurs comptes d'amortissements sont concernés par la dotation.*

Pour les autres écritures relatives à un compte de charges (#63, #64, #65, #681 hors 6811x, #66 et #686, #67 et #687 hors #6871, #69), la variation (Débit - Crédit) est incrémentée au montant courant de l'agrégat correspondant (taxes, charges de personnel, etc.).

### Ecritures relatives aux comptes de Produits

Pour chaque écriture relative à un compte de vente de produits #70, la variation (Débit - Crédit) est incrémentée au volume courant du chiffre d'affaires.


Pour chaque écriture relative à une variation de stock de production #71, la variation (Débit - Crédit) est incrémentée au volume courant de la production stockée.


Pour chaque écriture relative à un compte de production immobilisée #72, la variation (Débit - Crédit) est incrémentée au volume courant de la production immobilisée.


Pour les autres écritures relatives à un compte de produits, la variation (Débit - Crédit) est incrémentée au montant courant de l'agrégat correspondant :
- Autres produits d'exploitation (#74, #75, #781, #791)
- Produits financiers (#76, #786, #796)
- Produits exceptionnels (#77, #787, #797)


## AUTRES INFORMATIONS EXTRAITES

La lecture du FEC permet également d'extraire les montants des taxes d'apprentissage et des contributions des employeurs à la formation professionnelle, utilisés pour l'indicateur relatif à l'évolution des compétences et des connaissances.
