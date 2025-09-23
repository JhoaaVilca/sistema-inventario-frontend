import { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Dropdown } from "react-bootstrap";
import { Search, User, CheckCircle } from "lucide-react";
import apiClient from "../../servicios/apiClient";

const BusquedaCliente = ({
    onClienteSeleccionado,
    clienteSeleccionado,
    required = false,
    showAgregarCliente = false
}) => {
    const [dni, setDni] = useState("");
    const [clientes, setClientes] = useState([]);
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [validatingDni, setValidatingDni] = useState(false);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (showAgregarCliente) {
            cargarClientes();
        }
    }, [showAgregarCliente]);

    const cargarClientes = async () => {
        setLoadingClientes(true);
        try {
            const { data } = await apiClient.get("/clientes/activos");
            setClientes(data);
        } catch (err) {
            console.error("Error al cargar clientes:", err);
        } finally {
            setLoadingClientes(false);
        }
    };

    const validarDni = async () => {
        if (!dni || dni.length !== 8) {
            setError("DNI debe tener 8 dígitos");
            setClienteEncontrado(null);
            return;
        }

        setValidatingDni(true);
        setError("");

        try {
            const { data } = await apiClient.get(`/clientes/buscar-dni/${dni}`);

            if (data.existeEnBD) {
                // Cliente encontrado en BD local
                setClienteEncontrado(data);
                onClienteSeleccionado({
                    idCliente: data.idCliente,
                    dni: data.dni,
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    direccion: data.direccion,
                    telefono: data.telefono,
                    email: data.email
                });
            } else if (data.nombres) {
                // Cliente encontrado en RENIEC - Agregarlo automáticamente a la BD
                console.log("Cliente encontrado en RENIEC, agregando a BD local...");

                try {
                    const clienteData = {
                        dni: data.dni,
                        nombres: data.nombres,
                        apellidos: data.apellidos,
                        direccion: data.direccion,
                        telefono: data.telefono,
                        email: data.email
                    };

                    const { data: clienteGuardado } = await apiClient.post("/clientes", clienteData);

                    console.log("Cliente agregado automáticamente:", clienteGuardado);

                    // Seleccionar automáticamente el cliente guardado
                    setClienteEncontrado(clienteGuardado);
                    onClienteSeleccionado({
                        idCliente: clienteGuardado.idCliente,
                        dni: clienteGuardado.dni,
                        nombres: clienteGuardado.nombres,
                        apellidos: clienteGuardado.apellidos,
                        direccion: clienteGuardado.direccion,
                        telefono: clienteGuardado.telefono,
                        email: clienteGuardado.email
                    });

                    // Recargar la lista de clientes para el dropdown
                    cargarClientes();

                    // Mostrar mensaje de éxito
                    setError("");
                    setSuccessMsg(`✅ Cliente "${clienteGuardado.nombres} ${clienteGuardado.apellidos}" agregado automáticamente. Ahora aparece en la lista de clientes.`);

                } catch (err) {
                    console.error("Error al agregar cliente automáticamente:", err);
                    setError("Error al agregar cliente a la BD. Intente nuevamente.");
                }
            } else {
                // DNI no encontrado
                setClienteEncontrado(null);
                setError("DNI no encontrado en RENIEC");
            }
        } catch (err) {
            console.error("Error al validar DNI:", err);
            setClienteEncontrado(null);
            setError("Error al validar el DNI. Intente nuevamente.");
        } finally {
            setValidatingDni(false);
        }
    };

    const seleccionarCliente = (cliente) => {
        console.log("Cliente seleccionado del dropdown:", cliente);
        setClienteEncontrado(cliente);
        setDni(cliente.dni);
        setShowDropdown(false);

        const clienteData = {
            idCliente: cliente.idCliente,
            dni: cliente.dni,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            direccion: cliente.direccion,
            telefono: cliente.telefono,
            email: cliente.email
        };

        console.log("Datos del cliente a enviar:", clienteData);
        onClienteSeleccionado(clienteData);
    };

    const limpiarCliente = () => {
        setDni("");
        setClienteEncontrado(null);
        setError("");
        setSuccessMsg("");
        onClienteSeleccionado(null);
    };

    const getNombreCompleto = (cliente) => {
        if (!cliente) return "";
        return `${cliente.nombres} ${cliente.apellidos || ""}`.trim();
    };



    return (
        <div className="mb-3">
            <Form.Label>
                Cliente {required && <span className="text-danger">*</span>}
            </Form.Label>

            {/* Búsqueda por DNI */}
            <div className="d-flex gap-2 mb-2">
                <Form.Control
                    type="text"
                    placeholder="Buscar por DNI (8 dígitos)"
                    value={dni}
                    onChange={(e) => {
                        setDni(e.target.value);
                        setError("");
                        setSuccessMsg("");
                    }}
                    maxLength="8"
                    isInvalid={!!error}
                />
                <Button
                    variant="outline-primary"
                    onClick={validarDni}
                    disabled={!dni || dni.length !== 8 || validatingDni}
                    style={{ minWidth: '80px' }}
                >
                    {validatingDni ? (
                        <Spinner animation="border" size="sm" />
                    ) : (
                        <Search size={16} />
                    )}
                </Button>
                {clienteSeleccionado && (
                    <Button
                        variant="outline-secondary"
                        onClick={limpiarCliente}
                        size="sm"
                    >
                        Limpiar
                    </Button>
                )}
            </div>

            {/* Dropdown de clientes existentes */}
            {showAgregarCliente && (
                <div className="mb-2">
                    <Dropdown show={showDropdown} onToggle={setShowDropdown}>
                        <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            disabled={loadingClientes}
                        >
                            {loadingClientes ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    <User size={16} className="me-2" />
                                    Seleccionar cliente existente
                                </>
                            )}
                        </Dropdown.Toggle>

                        <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {clientes.map((cliente) => (
                                <Dropdown.Item
                                    key={cliente.idCliente}
                                    onClick={() => seleccionarCliente(cliente)}
                                >
                                    <div>
                                        <strong>{cliente.dni}</strong>
                                        <br />
                                        <small>{getNombreCompleto(cliente)}</small>
                                    </div>
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>


                </div>
            )}

            {/* Mensajes de error y éxito */}
            {error && (
                <Alert variant="danger" className="py-2 mb-2">
                    <small>{error}</small>
                </Alert>
            )}

            {successMsg && (
                <Alert variant="success" className="py-2 mb-2">
                    <small>{successMsg}</small>
                </Alert>
            )}

            {/* Cliente seleccionado */}
            {clienteEncontrado && (
                <Alert variant="info" className="py-2 mb-0">
                    <div className="d-flex align-items-center">
                        <CheckCircle size={16} className="me-2 text-success" />
                        <div>
                            <strong>Cliente seleccionado:</strong>
                            <br />
                            <small>
                                <strong>DNI:</strong> {clienteEncontrado.dni} |
                                <strong> Nombre:</strong> {getNombreCompleto(clienteEncontrado)}
                                {clienteEncontrado.direccion && (
                                    <> | <strong> Dirección:</strong> {clienteEncontrado.direccion}</>
                                )}
                            </small>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Cliente ya seleccionado previamente */}
            {clienteSeleccionado && !clienteEncontrado && (
                <Alert variant="success" className="py-2 mb-0">
                    <div className="d-flex align-items-center">
                        <User size={16} className="me-2" />
                        <div>
                            <strong>Cliente seleccionado:</strong>
                            <br />
                            <small>
                                <strong>DNI:</strong> {clienteSeleccionado.dni} |
                                <strong> Nombre:</strong> {getNombreCompleto(clienteSeleccionado)}
                                {clienteSeleccionado.direccion && (
                                    <> | <strong> Dirección:</strong> {clienteSeleccionado.direccion}</>
                                )}
                            </small>
                        </div>
                    </div>
                </Alert>
            )}


        </div>
    );
};

export default BusquedaCliente;
