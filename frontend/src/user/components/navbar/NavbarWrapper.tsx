import {Container, Nav, Navbar} from "react-bootstrap";


export const NavbarWrapper = () => {
	return (
		<>
			<Navbar bg="primary" variant="dark">
				<Container>
					<Navbar.Brand href="#home">Navbar</Navbar.Brand>
					<Nav className="me-auto">
						<Nav.Link href="#home"><i className="bi-alarm"></i>Home</Nav.Link>
						<Nav.Link href="#features">Stats</Nav.Link>
						<Nav.Link href="#pricing">Map</Nav.Link>
					</Nav>
				</Container>
			</Navbar>
		</>
	)
}