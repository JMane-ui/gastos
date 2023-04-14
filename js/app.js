const db = new PouchDB('expenses');

const app = Vue.createApp({
  data() {
    return {
      expenses: [],
      newExpense: {
        type: '',
        amount: '',
        description: ''
      },
      editedExpense: {
        _id: '',
        _rev: '',
        type: '',
        amount: '',
        description: ''
      }
    };
  },
  computed: {
    totalAmount() {
        return this.expenses.reduce((total,expense) => {
            return total + parseInt(expense.amount);
        }, 0);
    },
  },
  created() {
    // Recuperar todos los gastos de la base de datos local y mostrarlos en la lista
    db.allDocs({ include_docs: true }).then(response => {
      this.expenses = response.rows.map(row => row.doc);
    }).catch(error => console.log(error));
  },
  methods: {
    // Agregar un nuevo gasto a la base de datos local y remota
    addExpense() {
      const expense = {
        _id: new Date().toISOString(),
        type: this.newExpense.type,
        amount: Number(this.newExpense.amount),
        description: this.newExpense.description,
        date: new Date().toLocaleDateString()
      }
      db.put(expense).then(response => {
        expense._id = response.id;
        expense._rev = response.rev;
        this.expenses.push(expense);
        this.newExpense.type = '';
        this.newExpense.amount = '';
        this.newExpense.description = '';
      }).catch(error => console.log(error));
    },
    // Editar un gasto existente en la base de datos local y remota
    editExpense(expense) {
      this.editedExpense._id = expense._id;
      this.editedExpense._rev = expense._rev;
      this.editedExpense.type = expense.type;
      this.editedExpense.amount = expense.amount;
      this.editedExpense.description = expense.description;
    },
    saveExpense() {
      db.get(this.editedExpense._id).then(expense => {
        expense.type = this.editedExpense.type;
        expense.amount = Number(this.editedExpense.amount);
        expense.description = this.editedExpense.description;
        db.put(expense).then(() => {
          Object.assign(expense, this.editedExpense);
          this.editedExpense._id = '';
          this.editedExpense._rev = '';
          this.editedExpense.type = '';
          this.editedExpense.amount = '';
          this.editedExpense.description = '';
        }).catch(error => console.log(error));
      }).catch(error => console.log(error));
    },
    // Eliminar un gasto existente de la base de datos local y remota
    deleteExpense(expense) {
      db.get(expense._id).then(doc => {
        db.remove(doc).then(() => {
          this.expenses.splice(this.expenses.indexOf(expense), 1);
        }).catch(error => console.log(error));
      }).catch(error => console.log(error));
    }
  }
});

app.mount('#app');