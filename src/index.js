import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'


class Table extends React.Component {
  constructor(props) {
    super(props) //since we are extending class Table so we have to use super in order to override Component class constructor
    this.state = {
      countries: []
    }
  }

  render() {
    return (
      <div>
        <h1 id='title'>Country List</h1>
        <span>Name:</span>
        <input type="text" id="txtName"></input>
        <button id="btnSearch" onClick={this.OnSearch.bind(this)}>查詢</button>
        <table id='country'>
          <tbody>
            <tr>
              <th>國旗</th>
              <th>國家名稱</th>
              <th>2位國家代碼</th>
              <th>3位國家代碼</th>
              <th>母語名稱</th>
              <th>替代國家名稱</th>
              <th>國際電話區號</th>
            </tr>

            {this.renderTableData()}
          </tbody>
        </table>
      </div>
    )
  }
  componentDidMount() {
    this.OnSearch();
  }
  OnSearch() {
    var name = document.getElementById("txtName").value;
    var component = this;
    const request = require('request');
    var condition = 'all';//default
    //用name查詢國家
    if (name !== '')
      condition = 'name/' + name;

    var url = 'https://restcountries.eu/rest/v2/' + condition + '?fields=flag;name;alpha2Code;alpha3Code;nativeName;altSpellings;callingCodes';
    request(url, function (error, response, body) {
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

      if (response.statusCode === 200) {
        var json = JSON.parse(body);
        component.setState({
          "countries": json
        });
      } else {
        component.setState({
          "countries": null
        });
      }
    });
  }
  renderTableData() {
    console.log(this.state.countries)

    if (this.state.countries == null) {
      return (
        <tr>
          <td>查無資料</td>
        </tr>
      )
    } else {
      return this.state.countries.map((country) => {
        const { flag, name, alpha2Code, alpha3Code, nativeName, altSpellings, callingCodes } = country //destructuring
        return (
          <tr key={name}>
            <td><img src={flag} alt={name} className="td-image" /></td>
            <td>{name}</td>
            <td>{alpha2Code}</td>
            <td>{alpha3Code}</td>
            <td>{nativeName}</td>
            <td>{altSpellings}</td>
            <td>{callingCodes}</td>
          </tr>
        )
      })
    }
  }
}

// ========================================

ReactDOM.render(
  <Table />,
  document.getElementById('root')
);
