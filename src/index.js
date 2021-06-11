import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

class Table extends React.Component {
  constructor(props) {
    super(props) //since we are extending class Table so we have to use super in order to override Component class constructor
    this.state = {
      Countries: [],
      ShowingCountries: [],
      SortingClass: "fa fa-sort-alpha-asc",
      CurrentPage: 1
    }

    //let 'this' in func can be found
    this.SortTableClick = this.SortTableClick.bind(this);
    this.SwitchPage = this.SwitchPage.bind(this);
  }
  render() {
    return (
      <div id="container">
        <div>
          <h1 id='title'>Country List</h1>
          <label>Name:</label>
          <input type="text" id="txtName"></input>
          <button id="btnSearch" onClick={this.btnSearchClick.bind(this)}>查詢</button>
          <table id='country' className='CountryList'>
            <tbody>
              <tr>
                <th>國旗</th>
                <th className="SortCol" onClick={this.SortTableClick}>國家名稱 <i className={this.state.SortingClass} aria-hidden="true"></i></th>
                <th>2位國家代碼</th>
                <th>3位國家代碼</th>
                <th>母語名稱</th>
                <th>替代國家名稱</th>
                <th>國際電話區號</th>
              </tr>
              {this.RenderTableData()}
            </tbody>
          </table>
          {/* <nav aria-label="Page navigation example"> */}
          <ul className="Pagination" id="ulPagination"></ul>
          {/* </nav> */}
        </div>
        <div id="myModal" className="modal" >
          <div className="modal-content">
            <span className="close" onClick={this.CloseModalClick.bind(this)}>&times;</span>
            <div id="divModalContent"></div>
          </div>

        </div>
      </div >
    )
  }
  componentDidMount() {
    this.btnSearchClick();
    const pag = document.getElementById("ulPagination");
    pag.addEventListener('click', this.SwitchPage);
  }
  btnSearchClick() {
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
        json.sort(function (a, b) {
          var nameA = a.name.toUpperCase(); // ignore upper and lowercase
          var nameB = b.name.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        });
        if (component.state.SortingClass == "fa fa-sort-alpha-desc") {
          json = json.reverse();
        }
        component.setState({
          Countries: json,
          CurrentPage: 1,
          //ShowingCountries: json
        });
        component.Pagination(json);
      } else {
        component.setState({
          Countries: null,
          ShowingCountries: null
        });
        document.getElementById("ulPagination").innerHTML = '';
      }
    });
  }
  //打開modal
  OpenModalClick(name) {
    const request = require('request');
    var url = 'https://restcountries.eu/rest/v2/name/' + name;

    request(url, function (error, response, body) {
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

      var Content = '';
      if (response.statusCode === 200) {
        Content += '<table class="tableDetail">';
        var json = JSON.parse(body)[0];
        var skipCol = ["flag", "alpha2Code", "alpha3Code", "nativeName", "altSpellings", "callingCodes"];
        var objCol = ["currencies", "languages", "regionalBlocs", "translations"];

        for (var title in json) {
          if (skipCol.indexOf(title) >= 0) {
            continue;
          } else if (objCol.indexOf(title) >= 0) {
            Content += '<tr>';
            Content += '<td><label style="font-weight:bold; align:top;">' + title + '</label></td>';
            if (title === "translations") {
              Content += '<td>';
              for (var subcol in json[title]) {
                Content += '<label">' + subcol + ':' + json[title][subcol] + ' </label>';
              }
              Content += '</td>';
            } else {
              Content += '<td>';
              json[title].forEach(e => {
                for (var subcol in e) {
                  Content += '<label">' + subcol + ':' + e[subcol] + ' </label>';
                  // Content += subcol + ':' + e[subcol];
                  //   Content += ',';
                }
              });
              Content += '</td>';
            }

            // Content += '</label>'
            Content += '</tr>';
          } else {
            Content += '<tr>';
            Content += '<td><label style="font-weight:bold;align:top;">' + title + '</label></td>';
            Content += '<td><label>' + json[title] + '</label></td>'
            Content += '</tr>';
          }
        }

        Content += '</table>';
      } else {
        Content += '<p>查無資料</p>'
      }
      document.getElementById("divModalContent").innerHTML = Content;
      document.getElementById("myModal").style.display = "block";
    });
  }
  //關閉modal
  CloseModalClick() {
    document.getElementById("myModal").style.display = "none";
  }
  //以名稱排序
  SortTableClick() {
    if (this.state.SortingClass == "fa fa-sort-alpha-asc") {
      this.setState({ SortingClass: "fa fa-sort-alpha-desc" });
    }
    else {
      this.setState({ SortingClass: "fa fa-sort-alpha-asc" });
    }
    // console.log(this.state.countries);//table
    //console.log(e);//event
    //.reverse()
    this.setState({
      "Countries": this.state.Countries.reverse()
    });

    this.Pagination();
  }
  //產生頁數
  Pagination() {
    let Data = [];
    const Countries = this.state.Countries
    const CountriesCount = Countries.length;//資料總數
    const PerPage = 25;//每頁筆數
    const PageCount = Math.ceil(CountriesCount / PerPage);//頁面總數
    const CurrentPage = this.state.CurrentPage;

    // if (CurrentPage > PageCount) {
    //   CurrentPage = PageCount;
    // }
    const MinData = (CurrentPage - 1) * PerPage;
    let MaxData = (CurrentPage * PerPage);
    if (MaxData > CountriesCount) {
      MaxData = CountriesCount;
    }

    for (let i = MinData; i < MaxData; i++) {
      Data.push(Countries[i]);
    }

    console.log(Data);
    this.setState({
      ShowingCountries: Data
    });

    let pageHtml = '';
    if (CurrentPage !== 1) {
      pageHtml += '<li><a href="#" page=prev><</a></li>';
    }

    let MinPage = 1;
    if (CurrentPage > 6) {
      MinPage = CurrentPage - 5;
    }

    let MaxPage = MinPage + 9;
    if (MaxPage > PageCount) {
      MaxPage = PageCount;
    }

    for (let i = MinPage; i < MaxPage + 1; i++) {
      if (CurrentPage == i) {
        pageHtml += '<li><a class="active" href="#" page=' + i + '>' + (i) + '</a></li>';
      } else {
        pageHtml += '<li><a href="#" page=' + i + '>' + (i) + '</a></li>';
      }
    };

    //有下一頁
    if (CurrentPage != PageCount) {
      pageHtml += '<li><a href="#" page=next>></a></li>';
      // pageHtml += '<li class="page-item disabled"><span class="page-link">Next</span></li>';
    }

    document.getElementById("ulPagination").innerHTML = pageHtml;
  }
  SwitchPage(e) {
    e.preventDefault();
    const page = e.target.getAttribute("page");
    let currentPage = this.state.CurrentPage;
    if (page === 'prev') {
      currentPage--;
    } else if (page === 'next') {
      currentPage++;
    } else {
      currentPage = page;
    }

    this.setState({ CurrentPage: currentPage })
    this.Pagination();
  }
  RenderTableData() {
    if (this.state.ShowingCountries == null) {
      return (
        <tr>
          <td colSpan="7">查無資料</td>
        </tr>
      )
    } else {
      return this.state.ShowingCountries.map((country) => {
        const { flag, name, alpha2Code, alpha3Code, nativeName, altSpellings, callingCodes } = country //destructuring
        return (
          <tr key={name}>
            <td><img src={flag} alt={name} className="tdimage" /></td>
            <td className="tdOpenModal" onClick={() => this.OpenModalClick(name)}>{name}</td>
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
