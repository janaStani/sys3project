function CarComponent(props) {
    const { subcar } = props; // Destructure props to access subcar

    return (
        <div>
            <p>Subcar: {subcar}</p>
        </div>
    );
}
