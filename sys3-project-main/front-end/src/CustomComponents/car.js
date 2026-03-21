import React from "react";

class Car extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCar: null, // Currently selected car
            selectedSubcar: null, // Currently selected subcar
            searchQuery: "",
            subcars: {
                "BMW": {
                    "BMW X edition": ["X1", "X2", "X3", "X4", "X5", "X6", "X7",],
                    "BMW M edition": ["M2", "M3", "M4", "M5", "M6", "M8",],
                    "BMW i edition": ["i3", "i4", "i8",],
                    "BMW Z edition": ["Z3", "Z4", "Z8",],
                    },
                "Audi": {
                    "Audi A edition": ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8",],
                    "Audi Q edition": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",],
                    "Audi R edition": ["R8",],
                    "Audi TT edition": ["TT",],
                    },
                "Mercedes": {
                    "Mercedes A edition": ["A", "B", "C", "E", "S",],
                    "Mercedes G edition": ["G",],
                    "Mercedes S edition": ["S",],
                    "Mercedes V edition": ["V",],
                    },
                "Volkswagen": {
                    "Volkswagen Polo": ["Polo",],
                    "Volkswagen Golf": ["Golf",],
                    "Volkswagen Passat": ["Passat",],
                    "Volkswagen Tiguan": ["Tiguan",],
                    },
                "Toyota": {
                    "Toyota Yaris": ["Yaris",],
                    "Toyota Corolla": ["Corolla",],
                    "Toyota Camry": ["Camry",],
                    "Toyota RAV4": ["RAV4",],
                    },
                "Ford": {
                    "Ford Fiesta": ["Fiesta",],
                    "Ford Focus": ["Focus",],
                    "Ford Mondeo": ["Mondeo",],
                    "Ford Kuga": ["Kuga",],
                    },
    },
        };
    }

    handleClick = (car) => {
        this.setState({ 
            selectedCar: car, 
            selectedSubcar: null, 
            selectedDeeperSubcar: null
        });
    };

    handleSubcarClick = (subcar) => {
        this.setState({ 
            selectedSubcar: subcar, 
            selectedDeeperSubcar: null
        });
    };

    handleDeeperSubcarClick = (deeperSubcar) => {
        if (Array.isArray(this.state.subcars[this.state.selectedCar][this.state.selectedSubcar])) {
            this.setState({ 
                selectedBook: deeperSubcar 
            });
        } else {
            this.setState({ 
                selectedDeeperSubcar: deeperSubcar, 
                selectedBook: null 
            });
        }
    };

    handleBookClick = (bookName) => {
        this.setState({ 
            selectedBook: bookName,
            selectedDeeperSubcar: null, 
            selectedSubcar: null, 
            selectedCar: null 
        });
    };

    filterBooks = (books) => {
        const { searchQuery } = this.state;
        return books.filter(book => book.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    handleSearchChange = (e) => {
        this.setState({ searchQuery: e.target.value });
    };

    handleBack = () => {
        if (this.state.selectedBook) {
            this.setState({ 
                selectedBook: null, 
                selectedDeeperSubcar: null 
            });
        } else if (this.state.selectedDeeperSubcar) {
            this.setState({ 
                selectedDeeperSubcar: null 
            });
        } else if (this.state.selectedSubcar) {
            this.setState({ 
                selectedSubcar: null 
            });
        } else if (this.state.selectedCar) {
            this.setState({ 
                selectedCar: null 
            });
        }
    };

    getBookColor = (bookName) => {
        const colors = ["#003F5C", "#006400", "#FF0000", "#FFA500", "#800080"];
        return colors[bookName.length % colors.length];
    };

    renderBook = (book) => (
        <div 
            key={book}
            style={{ 
                padding: "10px",
                backgroundColor: this.getBookColor(book),
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
                textAlign: "center",
                fontWeight: "bold",
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box"
            }}
            onClick={() => this.handleBookClick(book)}
        >
            {book}
        </div>
    );

    render() {
        const { selectedCar, selectedSubcar, selectedDeeperSubcar, selectedBook, subcars } = this.state;
        const books = selectedCar && selectedSubcar && selectedDeeperSubcar
            ? subcars[selectedCar][selectedSubcar][selectedDeeperSubcar] || []
            : [];

        return (
            <div style={{ textAlign: "center", position: "relative", minHeight: "100vh", paddingBottom: "50px" }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={this.state.searchQuery}
                    onChange={this.handleSearchChange}
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        fontSize: "16px",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                        outline: "none",
                        position: "relative",
                        zIndex: 1
                    }}
                />
                {selectedCar || selectedSubcar || selectedDeeperSubcar || selectedBook ? (
                    <button 
                        className="btn btn-danger"
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            left: "20px",
                            padding: "10px",
                            fontSize: "16px",
                            backgroundColor: "#003f5c",
                            border: "2px solid #003f5c",
                            color: "#ffffff",
                            borderRadius: "5px",
                            cursor: "pointer",
                            display: "block"
                        }}
                        onClick={this.handleBack}
                    >
                        Back
                    </button>
                ) : null}
                
                {!selectedCar && !selectedBook ? (
                    <>
                        <h1 style={{ color: "white" }}>Choose one of the libraries below</h1>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            {Object.keys(subcars).map((car) => (
                                <div key={car} style={{ margin: "10px", flex: "0 0 calc(33.333% - 20px)" }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            fontSize: "16px",
                                            backgroundColor: "#003f5c",
                                            border: "2px solid #003f5c",
                                            color: "#ffffff",
                                            borderRadius: "5px"
                                        }}
                                        onClick={() => this.handleClick(car)}
                                    >
                                        {car}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : !selectedSubcar && !selectedBook ? (
                    <>
                        <h3 style={{ color: "white" }}>Subcars of {selectedCar}:</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            {Object.keys(subcars[selectedCar]).map((subcar) => (
                                <div key={subcar} style={{ margin: "10px", flex: "0 0 calc(33.333% - 20px)" }}>
                                    {subcar === "Page under construction" ? (
                                        <p style={{ color: "red", fontWeight: "bold" }}>Page under construction</p>
                                    ) : (
                                        <button
                                            className="btn btn-secondary"
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                fontSize: "16px",
                                                backgroundColor: "#003f5c",
                                                border: "2px solid #003f5c",
                                                color: "#ffffff",
                                                borderRadius: "5px"
                                            }}
                                            onClick={() => this.handleSubcarClick(subcar)}
                                        >
                                            {subcar}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : !selectedDeeperSubcar && !selectedBook ? (
                    <>
                        <h3 style={{ color: "white" }}>{selectedSubcar} Subcars in {selectedCar}:</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            {Object.keys(subcars[selectedCar][selectedSubcar]).map((deeperSubcar) => (
                                <div key={deeperSubcar} style={{ margin: "10px", flex: "0 0 calc(33.333% - 20px)" }}>
                                    {deeperSubcar === "Page under construction" ? (
                                        <p style={{ color: "red", fontWeight: "bold" }}>Page under construction</p>
                                    ) : (
                                        <button
                                            className="btn btn-success"
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                fontSize: "16px",
                                                backgroundColor: "#003f5c",
                                                border: "2px solid #003f5c",
                                                color: "#ffffff",
                                                borderRadius: "5px"
                                            }}
                                            onClick={() => this.handleDeeperSubcarClick(deeperSubcar)}
                                        >
                                            {deeperSubcar}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : selectedBook ? (
                    <>
                        <div style={{ margin: "20px" }}>
                            <h3 style={{ color: "white" }}>Selected Book:</h3>
                            <div style={{ 
                                textAlign: "center",
                                fontSize: "20px",
                                backgroundColor: "#003f5c",
                                color: "white",
                                padding: "20px",
                                borderRadius: "5px"
                            }}>
                                {selectedBook}
                            </div>
                        </div>
                        <button 
                            className="btn btn-danger"
                            style={{
                                position: "fixed",
                                bottom: "20px",
                                left: "20px",
                                padding: "10px",
                                fontSize: "16px",
                                backgroundColor: "#003f5c",
                                border: "2px solid #003f5c",
                                color: "#ffffff",
                                borderRadius: "5px",
                                cursor: "pointer",
                                display: "block"
                            }}
                            onClick={this.handleBack}
                        >
                            Back
                        </button>
                    </>
                ) : (
                    <>
                        <h3 style={{ color: "white" }}>Books in {selectedDeeperSubcar}:</h3>
                        <div style={{ 
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "10px",
                            margin: "0 auto",
                            maxWidth: "1200px"
                        }}>
                            {this.filterBooks(books).map(this.renderBook)}
                        </div>
                        <button 
                            className="btn btn-danger"
                            style={{
                                position: "fixed",
                                bottom: "20px",
                                left: "20px",
                                padding: "10px",
                                fontSize: "16px",
                                backgroundColor: "#003f5c",
                                border: "2px solid #003f5c",
                                color: "#ffffff",
                                borderRadius: "5px",
                                cursor: "pointer",
                                display: "block"
                            }}
                            onClick={this.handleBack}
                        >
                            Back
                        </button>
                    </>
                )}
            </div>
        );
    }
}

export default Car;