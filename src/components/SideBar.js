import React, { Component } from 'react'    
import  { slide as Menu } from 'react-burger-menu'
import escapeRegExp from 'escape-string-regexp';

class SideBar extends Component {
    state = {
        searchTerm: '',
        filteredMarkers: [],
        filteredLocationsList: this.props.locations,
        currentMarker: {},
    }
    
	componentDidMount() {
		this.setState({
			filteredMarkers: this.props.markers
        });
        
        const burgerMenu = document.querySelector('.bm-burger-button')
        burgerMenu.setAttribute('role', 'button')
        const burgerMenuButton = burgerMenu.querySelector('button')
        burgerMenu.tabIndex=1
        burgerMenuButton.tabIndex=1
	}

    updateQuery = (searchTerm) => {
        this.setState({
            searchTerm
        })
  
        this.getSearchList(searchTerm)
    }
    
	getSearchList = (searchTerm) => {
        let filteredLocations, filteredMarkers
        
        if(searchTerm==='') {
            this.setState({
				filteredLocationsList: this.props.locations,
				filteredMarkersList: this.props.markers
			});

        } else {
            const match = new RegExp(escapeRegExp(searchTerm), 'i');
            filteredLocations = this.props.locations.filter(location => {
               return match.test(location.title)
                
            })
            filteredMarkers = this.props.markers.filter(marker => {
               return match.test(marker.title)
            })
            
			this.setState({
				filteredLocationsList: filteredLocations,
				filteredMarkersList: filteredMarkers
			});
        }    
         
		this.props.markers.map(marker => marker.setVisible(false));
		setTimeout( ()  => {
			this.state.filteredMarkersList.map(marker =>
				this.handleMarkersVisibility(marker))
		}, 1)
    }

    handleMarkersVisibility = (marker) => {
        this.state.filteredMarkers.map(filteredMarker =>
            filteredMarker.id === marker.id && marker.setVisible(true)
        )
    }    

    clickedLocationInfoWindow = (id) => {
        const clickedMarker = this.props.markers.find(element =>
            element.id === id
        )
        window.google.maps.event.trigger(clickedMarker, 'click');
        clickedMarker.setOptions({opacity: 0.5})
    }



    render () {
        return (
          <Menu className="options-box" tabIndex={1}>
                <div className="search-locations-input">
                <input 
                    type="text" 
                    placeholder="Search by location title"
                    value={this.state.searchTerm}
                    onChange={(event) => {
                            this.updateQuery(event.target.value) 
                        }
                    }
                />
                <ul className="locations-list">
					{
						this.state.filteredLocationsList.map(location => (
							<li
								tabIndex={2}
								role="button"
								className="location-item"
                                key={location.key}
								onClick={() => 
									this.clickedLocationInfoWindow(location.key)}
								onKeyPress={() => 
									this.clickedLocationInfoWindow(location.key)}
							>
								{location.title}
							</li>
						))
					}
				</ul>
                </div>
          </Menu>
        );
      }
}

export default SideBar