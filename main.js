// ----Add variable for My Mab----
var myMap;
var myView;
// ----Add Require to use it to view my map from ESRI API----
require([
  "esri/config", "esri/Map", "esri/views/MapView", "esri/widgets/Search",
  "esri/Graphic", "esri/rest/route", "esri/rest/support/RouteParameters",
  "esri/rest/support/FeatureSet", "esri/symbols/WebStyleSymbol", "esri/rest/locator","esri/layers/FeatureLayer"],
  (esriConfig, Map, MapView, Search, Graphic, route,
    RouteParameters, FeatureSet, WebStyleSymbol, locator,FeatureLayer) => {
    // ----My Api Key from esri devolper----
    esriConfig.apiKey = "AAPK2efeefa459c247c285699550bdfeb065cX-t2RRHVoRG8n02UHr6KiH7HXiEJRtK2PAix1XAFZ9C4WzcQgLjotFPeJ7OSFko";
  //  ----URL for Routing Services----
   var routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
  // ----Drop Basemap----
    myMap = new Map({
      basemap: "arcgis-charted-territory"
    });
// ----View My Map---- 
    myView = new MapView({
      map: myMap,
      container: "mapf",
      zoom: 5,
      center: [30, 30]
    });
    // 
    function myLayer(url) {
      mLayer = new FeatureLayer({
        url: url
      });
      myMap.layers.removeAll();
      myMap.add(mLayer);
    }
  // 
  function handleButtonClick() {
    var inputurl = document.getElementById('inputurl');
    var url = inputurl.value;
    myLayer(url);
  }

  // ----input element by id----
  var inputElement = document.getElementById('inputurl');
  var buttonElement = document.getElementById('searchButton');

  // ----Add event listener to the button element----
  buttonElement.addEventListener('click', handleButtonClick);
//  ----Event 'on' to click 
    myView.on("click", ({ mapPoint }) => {
      if (myView.graphics.length === 0) {
        myView.graphics.add(addGraphic('origin', mapPoint));
      } else if (myView.graphics.length === 1) {
        myView.graphics.add(addGraphic('destination', mapPoint));
        var stops = new FeatureSet({
          features: myView.graphics.toArray()
        });

        getRoute(stops);

      } else {
        myView.graphics.removeAll();
        myView.graphics.add(addGraphic('origin', mapPoint));
      }
    });

    function addGraphic(type, geometry) {
      var graphic = new Graphic({
        geometry,
        symbol: {
          type: "simple-marker",
          color: (type === 'origin') ? 'blue' : 'red',
          size: "10px"
        }
      });

      return graphic;
    }

    async function getRoute(stops) {
      var routeParams = new RouteParameters({ stops });
      var { routeResults } = await route.solve(routeUrl, routeParams);
      routeResults.forEach((result) => {
        result.route.symbol = {
          type: 'simple-line',
          color: "dodgerblue",
          width: "7px",
          style: "short-dot",
        };
        myView.graphics.add(result.route);
      });
    }

// ----View Search and search for geocode----
    var searchWidget = new Search({
      view: myView
    });

    myView.ui.add(searchWidget, {
      position: "top-right",
      index: 2
    });

    myView.when(() => {
      console.log('view ready');
    });
    // ----URL for geocode----
    var serviceUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
    var params = {
      address: {
        "adress": "Zamalek, Cairo Governorate 4270020"
      }
    }

    locator.addressToLocations(serviceUrl, params).then((results) => {
      myView.when(() => {
        showResult(results);
      });
    });

    function showResult(results) {
      if (results.length) {
//  ----variable for symbol----
        var result = results[0];
        var resultSymbol = new WebStyleSymbol({
          name: "Standing Diamond",
          styleName: "EsriThematicShapesStyle"
        });
        var resultGraphic = new Graphic({

          sumbol: resultSymbol,
          geometry: result.location,
          attributes: {
            title: "Address",
            address: result.address
          },

          popupTemplate: {
            title: "{title}",
            content: result.address + "<br><br>" + result.location.longitude.toFixed(5) + "," + result.location.latitude.toFixed(5),
          }


        });
        myView.graphics.add(resultGraphic);
        myView.goTo({
          target: resultGraphic,
          zoom: 13
        }).then(function () {

          myView.popup.open({

            features: [resultGraphic],
            location: resultGraphic.geometry
          });


        });


      }
      }
    });
   

 