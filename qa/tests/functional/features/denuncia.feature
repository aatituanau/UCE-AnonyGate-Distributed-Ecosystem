Feature: Ciclo de Vida de Denuncia y Gestión de Usuarios
  Como usuario del sistema, analista y administrador
  Quiero ejecutar el flujo completo de una denuncia
  Para asegurar el correcto funcionamiento del ecosistema AnonyGate.

  # CASO 1
  Scenario: Envío de denuncia anónima y generación de Alias
    Given que me encuentro en la página principal de la aplicación en "http://3.92.247.156:8080"
    When selecciono cualquier categoría del formulario
    And completo los campos requeridos con "Denuncia de Fraude"
    And envío el formulario de denuncia
    Then debería ver mi "Alias" generado en la pantalla

  # CASO 2
  Scenario: Consulta de estado inicial (Recibido)
    Given que me encuentro en la página principal de la aplicación en "http://3.92.247.156:8080"
    When hago clic en el botón "Consultar Estado"
    And ingreso mi alias generado previamente
    And hago clic en el botón "Buscar"
    Then el sistema debería mostrarme que el estado actual es "SUBMITTED"

  # CASO 3
  Scenario: Analista cambia el estado de la denuncia
    Given que me encuentro en la página principal de la aplicación en "http://3.92.247.156:8080"
    When hago clic en "Acceso Personal" y entro como analista
    And busco la denuncia reciente
    And cambio el estado de la denuncia a "IN_REVIEW"
    And guardo los cambios y cierro sesión
    Then el sistema debería confirmar la actualización exitosa

  # CASO 4
  Scenario: Consulta de estado actualizado (En Revisión)
    Given que me encuentro en la página principal de la aplicación en "http://3.92.247.156:8080"
    When hago clic en el botón "Consultar Estado"
    And ingreso mi alias generado previamente
    And hago clic en el botón "Buscar"
    Then el sistema debería mostrarme que el estado actual es "IN_REVIEW"

  # CASO 5
  Scenario: Administrador crea un nuevo analista
    Given que me encuentro en la página principal de la aplicación en "http://3.92.247.156:8080"
    When inicio sesión como administrador
    And navego a la sección para crear un analista
    And completo los datos del nuevo analista y lo creo
    Then el nuevo analista debe aparecer en el sistema
