# DOCUMENTATION - FEC READER

Les journaux faisant l'objet d'une lecture sont les suivants :
- A-Nouveaux
- Journal des ventes
- Journal des achats
- Opérations diverses & Inventaires

L'identification des journaux s'effectue via le code et/ou le libellé du journal.

| Journal | Code(s) reconnu(s) | Libellé(s) recconu(s) |
| ------- | ------------------ | --------------------- |
| A-Nouveaux | AN | "A NOUVEAUX","A NOUVEAU" |
| Ventes | VE, VT | "VENTES" |
| Achats | HA | "ACHATS", "BANQUE" |
| Opérations diverses | OD, ODA, INV | |


## JOURNAL A-NOUVEAUX

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