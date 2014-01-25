/**
 * (c) 2005 - 2009 Sxoop Technologies Ltd. All rights reserved.
 *
 * support@sxoop.com
 */
var PXN8 = PXN8 || {};

PXN8.strings = {};

// alert when no more redo
PXN8.strings.NO_MORE_REDO     = decodeURI("%C2%ADNo hay m%C3%A1s operaciones que rehacer!");

// alert when no more undo
PXN8.strings.NO_MORE_UNDO     = decodeURI("%C2%ADNo hay m%C3%A1s operaciones que deshacer!");


// alert when fully zoomed in
PXN8.strings.NO_MORE_ZOOMIN   = decodeURI("%C2%ADNo se puede acercar m%C3%A1s la imagen!");

// alert when fully zoomed out
PXN8.strings.NO_MORE_ZOOMOUT       = decodeURI("%C2%ADNo se puede alejar m%C3%A1s la imagen!");

// alert when using old IE (pre 6.0)
PXN8.strings.MUST_UPGRADE_IE       = decodeURI("Debe actualizar a Internet Explorer 6.0 para usar PXN8");

// alert when AJAX request fails due to server error
PXN8.strings.WEB_SERVER_ERROR      = decodeURI("Error del servidor web");

// alert when an image fails to load due to bad URL
PXN8.strings.IMAGE_ON_ERROR1       = decodeURI("Se ha producido un error mientras se intentaba cargar");

PXN8.strings.IMAGE_ON_ERROR2       = decodeURI("\nPor favor compruebe que la URL es correcta e int%C3%A9ntelo de nuevo");

// alert when no pxn8_config_content div has been defined
PXN8.strings.NO_CONFIG_CONTENT     = decodeURI("ERROR: no hay un elemento config_content definido en su plantilla html");

PXN8.strings.CONFIG_BLUR_TOOL      = decodeURI("Configurar herramienta de desenfoque (Blur)");

// appears at the bottom of the blur config tool
PXN8.strings.BLUR_PROMPT           = decodeURI("Introduzca un valor entre 1 y 8 para el radio del desenfoque. Un radio mayor da como resultado una imagen m%C3%A1s desenfocada.");

// alert when blur out of range
PXN8.strings.BLUR_RANGE            = decodeURI("El radio del desenfoque debe estar entre 1 y 8");

PXN8.strings.RADIUS_LABEL          = decodeURI("Radio:");

// alert when brightness out of range
PXN8.strings.BRIGHTNESS_RANGE      = decodeURI("Introduzca un valor porcentual para el brillo");

// alert when hue out of range
PXN8.strings.HUE_RANGE             = decodeURI("El valor de matiz debe ester entre 0 y 200");

// alert when saturation out of range
PXN8.strings.SATURATION_RANGE      = decodeURI("Introduzca un valor porcentual para la saturaci%C3%B3n");

// appears at the top of the crop tool panel
PXN8.strings.CONFIG_CROP_TOOL      = decodeURI("Configure la herramienta de corte (crop)");

PXN8.strings.CONFIG_COLOR_TOOL     = decodeURI("Cambie colores");

// appears at the top of the lens filter tool panel
PXN8.strings.CONFIG_FILTER_TOOL    = decodeURI("Configure el filtro de lente");

// appears at the bottom of the blur config tool.
PXN8.strings.FILTER_PROMPT         = decodeURI("Haga clic sobre la imagen y un filtro graduado del color y la opacidad seleccionados aparecer%C3%A1 sobre la imagen");

// appears at the top of the interlace tool panel
PXN8.strings.CONFIG_INTERLACE_TOOL = decodeURI("Configure el efecto de entrelazado");

PXN8.strings.INTERLACE_PROMPT       = decodeURI("Crea una capa entrelazada sobre la imagen para que parezca una captura de TV.");

PXN8.strings.INVALID_HEX_VALUE      = decodeURI("Debe introducir un valor de color hexadecimal o elegir uno de la paleta de colores");

PXN8.strings.CONFIG_LOMO_TOOL       = decodeURI("Configure el efecto Lomo");

PXN8.strings.OPACITY_PROMPT         = decodeURI("Una opacidad baja significa esquinas m%C3%A1s oscuras. Una opacidad alta significa esquinas m%C3%A1s claras.");

PXN8.strings.OPACITY_RANGE          = decodeURI("La opacidad debe estar enntre 0 y 100");

PXN8.strings.WHITEN_SELECT_AREA     = decodeURI("Debe seleccionar el %C3%A1rea de la imagen que desea blanquear");

PXN8.strings.CONFIG_WHITEN_TOOL     = decodeURI("Configure el efecto blanquear");

PXN8.strings.CROP_SELECT_AREA       = decodeURI("Debe seleccionar el %C3%A1rea de la imagen que quiere recortar");

PXN8.strings.RESIZE_SELECT_AREA     = decodeURI("Debe seleccionar un %C3%A1rea para redimensionar.");

PXN8.strings.RESIZE_SELECT_LABEL    = decodeURI("Redimensionar a la zona seleccionada.");

PXN8.strings.SELECT_SMALLER_AREA    = decodeURI("Por favor, seleccione una zona m%C3%A1s peque%C3%B1a");

PXN8.strings.REDEYE_SELECT_AREA     = decodeURI("Debe seleccionar el %C3%A1rea que quiere arreglar");

PXN8.strings.REDEYE_SMALLER_AREA    = decodeURI("Por favor, seleccione una zona m%C3%A1s peque%C3%B1a para arreglar(menos de 100x100)");

PXN8.strings.CONFIG_REDEYE_TOOL     = decodeURI("Corregir ojos rojos");

PXN8.strings.REDEYE_PROMPT          = decodeURI("Para corregir los ojos rojos, seleccione la zona afectada y haga clic sobre el bot%C3%B3n 'Aplicar'.");

PXN8.strings.NUMERIC_WIDTH_HEIGHT   = decodeURI("Debe especificar un valor num%C3%A9rico para la nueva anchura y altura");

PXN8.strings.LIMIT_SIZE             = decodeURI("No puede redimensionar a m%C3%A1s de ");

PXN8.strings.ASPECT_LABEL           = decodeURI("Mantenga la proporci%C3%B3n: ");

PXN8.strings.ASPECT_CROP_LABEL      = decodeURI("Proporci%C3%B3n: ");

PXN8.strings.CROP_FREE              = decodeURI("selecci%C3%B3n libre");

PXN8.strings.CROP_SQUARE            = decodeURI("(cuadrado)");

PXN8.strings.WIDTH_LABEL            = decodeURI("Anchura: ");

PXN8.strings.HEIGHT_LABEL           = decodeURI("Altura: ");

PXN8.strings.FLIPVT_LABEL           = decodeURI("Voltear verticalmente: ");

PXN8.strings.FLIPHZ_LABEL           = decodeURI("Voltear horizontalmente: ");

PXN8.strings.ANGLE_LABEL            = decodeURI("%C3%81ngulo: ");

PXN8.strings.OPACITY_LABEL          = decodeURI("Opacidad: ");

PXN8.strings.CONTRAST_NORMAL        = decodeURI("Normal ");

PXN8.strings.COLOR_LABEL            = decodeURI("Color: ");

PXN8.strings.SEPIA_LABEL            = decodeURI("Sepia");

PXN8.strings.SATURATE_LABEL         = decodeURI("Saturar:");

PXN8.strings.GRAYSCALE_LABEL        = decodeURI("Escala de grises:");

PXN8.strings.ORIENTATION_LABEL      = decodeURI("Orientaci%C3%B3n: ");

PXN8.strings.CONFIG_RESIZE_TOOL     = decodeURI("Redimensionar imagen");

PXN8.strings.CONFIG_ROTATE_TOOL     = decodeURI("Rotar o voltear imagen");

PXN8.strings.SPIRIT_LEVEL_PROMPT1   = decodeURI("Por favor, haga clic sobre la mitad izquierda del horizonte recortado.");

PXN8.strings.SPIRIT_LEVEL_PROMPT2   = decodeURI("OK. Ahora haga clic sobre la mitad derecha del horizonte recortado.");

PXN8.strings.CONFIG_SPIRITLVL_TOOL  = decodeURI("Modo de nivelado de horizonte (Spirit-level)");

PXN8.strings.CONFIG_ROUNDED_TOOL    = decodeURI("Configure las esquinas redondeadas");

PXN8.strings.CONFIG_BW_TOOL         = decodeURI("Configure los tonos sepia o blanco y negro");

PXN8.strings.ORIENTATION_PORTRAIT   = decodeURI("Retrato");

PXN8.strings.ORIENTATION_LANDSCAPE  = decodeURI("Paisaje");

PXN8.strings.PROMPT_ROTATE_CHOICE   = decodeURI("Por favor, especifique un %C3%A1ngulo de rotaci%C3%B3n o cambie la orientaci%C3%B3n");

PXN8.strings.BW_PROMPT              = decodeURI("Pase su fotograf%C3%ADa a blanco y negro o a%C3%B1ada un tono sepia.");

PXN8.strings.IMAGE_UPDATING         = decodeURI("Se est%C3%A1 actualizando la imagen.\nPor favor; espere a que se complete la operaci%C3%B3n actual.");

PXN8.strings.BRIGHTNESS_LABEL        = decodeURI("brillo");

PXN8.strings.SATURATION_LABEL        = decodeURI("saturaci%C3%B3n");

PXN8.strings.CONTRAST_LABEL        = decodeURI("contraste");

PXN8.strings.HUE_LABEL             = decodeURI("matiz");

PXN8.strings.UPDATING              = decodeURI("Modificando la foto. Espera por favor...");

PXN8.strings.CONFIG_OILPAINT_TOOL    = decodeURI("Applicar efecto de 'Oil-Paint'");

PXN8.strings.CONFIG_CHARCOAL_TOOL    = decodeURI("Applicar efecto de 'Charcoal'");

PXN8.strings.SAVING_HI_RES         = "Saving High-Resolution image. Please wait a moment...";

PXN8.strings.INVALID_PARAMETER     = "Invalid parameter passed to function.";

PXN8.strings.RESET                 = "Reset";
