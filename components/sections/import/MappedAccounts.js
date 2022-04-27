import React, { useState } from 'react'
import { FormSelect, Table } from 'react-bootstrap'

function MappedAccounts(props) {

  console.log(props);
  
  const [accounts] = useState(props.data);

  
  return (
    <div>
                <h3 className="subtitle underline">Associations des comptes d'amortissements et de dépréciations </h3>

                <Table size="lg" bordered hover>
                  <thead>
                      <th>Numéro de compte</th>
                      <th>Libellé du compte</th>
                      <th>Compte associé</th>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Compte</td>
                      <td>Libellé</td>
                      <td>
                        <FormSelect id="accountAux" size="sm">
                        <option value="default">Default select</option>
                        </FormSelect>
                      </td>
                    </tr>
                  </tbody>
                </Table>
    </div>
  )
}

export default MappedAccounts