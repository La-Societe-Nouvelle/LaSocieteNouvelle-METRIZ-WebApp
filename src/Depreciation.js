import {Expense} from '/src/Expense.js'

export class Depreciation extends Expense {

  constructor(props) 
  {
    // Expenses props
    super(props)

    // Year
    this.year = props.year!=undefined ? props.year : "";
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.year = backUp.year;
  }

  /* ---------- Setters ---------- */

  setYear(year) {this.year = year}

  /* ---------- Getters ---------- */

  getYear() {return this.year}

}