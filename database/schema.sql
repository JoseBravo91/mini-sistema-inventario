-- Script de base de datos: MiniSistema de Gestion de Inventario
-- Motor: PostgreSQL 15+
-- Ejecutar con: psql -U postgres -f schema.sql

-- Cierra conexiones activas (ej. el backend corriendo) para poder recrear la base sin errores
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'inventario_db' AND pid <> pg_backend_pid();

-- Elimina la base si existe para permitir reinstalacion limpia
DROP DATABASE IF EXISTS inventario_db;
CREATE DATABASE inventario_db;

\connect inventario_db

-- Extension requerida para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipo enumerado para el tipo de movimiento de inventario
DROP TYPE IF EXISTS tipo_movimiento;
CREATE TYPE tipo_movimiento AS ENUM ('ENTRADA', 'SALIDA');

-- Tabla de usuarios del sistema (login y auditoria de movimientos)
DROP TABLE IF EXISTS usuarios CASCADE;
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'OPERADOR',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de productos administrados en el inventario
DROP TABLE IF EXISTS productos CASCADE;
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    stock_minimo INTEGER NOT NULL DEFAULT 10 CHECK (stock_minimo >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de movimientos de inventario (entradas y salidas)
DROP TABLE IF EXISTS movimientos CASCADE;
CREATE TABLE movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    tipo tipo_movimiento NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    observacion VARCHAR(500)
);

-- Indices de apoyo para los listados y reportes mas frecuentes
CREATE INDEX idx_movimientos_producto ON movimientos(producto_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_productos_activo ON productos(activo);

-- Funcion: calcula el inventario actual por producto (entradas - salidas)
DROP FUNCTION IF EXISTS fn_inventario_actual();
CREATE OR REPLACE FUNCTION fn_inventario_actual()
RETURNS TABLE (
    producto_id INTEGER,
    codigo VARCHAR(30),
    nombre VARCHAR(150),
    precio NUMERIC(12, 2),
    stock_minimo INTEGER,
    stock_actual BIGINT,
    estado VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.codigo,
        p.nombre,
        p.precio,
        p.stock_minimo,
        COALESCE(SUM(
            CASE
                WHEN m.tipo = 'ENTRADA' THEN m.cantidad
                WHEN m.tipo = 'SALIDA' THEN -m.cantidad
                ELSE 0
            END
        ), 0)::BIGINT AS stock_actual,
        CASE
            WHEN COALESCE(SUM(
                CASE
                    WHEN m.tipo = 'ENTRADA' THEN m.cantidad
                    WHEN m.tipo = 'SALIDA' THEN -m.cantidad
                    ELSE 0
                END
            ), 0) <= 0 THEN 'AGOTADO'
            WHEN COALESCE(SUM(
                CASE
                    WHEN m.tipo = 'ENTRADA' THEN m.cantidad
                    WHEN m.tipo = 'SALIDA' THEN -m.cantidad
                    ELSE 0
                END
            ), 0) <= p.stock_minimo THEN 'BAJO'
            ELSE 'NORMAL'
        END::VARCHAR(20) AS estado
    FROM productos p
    LEFT JOIN movimientos m ON m.producto_id = p.id
    WHERE p.activo = TRUE
    GROUP BY p.id, p.codigo, p.nombre, p.precio, p.stock_minimo
    ORDER BY p.nombre;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento: registra una entrada de inventario
DROP PROCEDURE IF EXISTS sp_registrar_entrada(INTEGER, INTEGER, INTEGER, VARCHAR);
CREATE OR REPLACE PROCEDURE sp_registrar_entrada(
    p_producto_id INTEGER,
    p_cantidad INTEGER,
    p_usuario_id INTEGER,
    p_observacion VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a cero';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM productos WHERE id = p_producto_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'El producto no existe o no esta activo';
    END IF;

    INSERT INTO movimientos (producto_id, tipo, cantidad, usuario_id, observacion)
    VALUES (p_producto_id, 'ENTRADA', p_cantidad, p_usuario_id, p_observacion);
END;
$$;

-- Procedimiento: registra una salida de inventario validando stock suficiente
DROP PROCEDURE IF EXISTS sp_registrar_salida(INTEGER, INTEGER, INTEGER, VARCHAR);
CREATE OR REPLACE PROCEDURE sp_registrar_salida(
    p_producto_id INTEGER,
    p_cantidad INTEGER,
    p_usuario_id INTEGER,
    p_observacion VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock_actual BIGINT;
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a cero';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM productos WHERE id = p_producto_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'El producto no existe o no esta activo';
    END IF;

    -- Calcula el stock disponible antes de autorizar la salida
    SELECT COALESCE(SUM(
        CASE
            WHEN tipo = 'ENTRADA' THEN cantidad
            WHEN tipo = 'SALIDA' THEN -cantidad
            ELSE 0
        END
    ), 0) INTO v_stock_actual
    FROM movimientos
    WHERE producto_id = p_producto_id;

    IF v_stock_actual < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente: disponible %, solicitado %', v_stock_actual, p_cantidad;
    END IF;

    INSERT INTO movimientos (producto_id, tipo, cantidad, usuario_id, observacion)
    VALUES (p_producto_id, 'SALIDA', p_cantidad, p_usuario_id, p_observacion);
END;
$$;

-- Datos semilla: usuario administrador (contrasena: Admin123!)
-- Hash BCrypt generado con factor de costo 11
INSERT INTO usuarios (nombre_usuario, contrasena_hash, nombre_completo, rol)
VALUES ('admin', '$2b$11$ftF0miSCvt6x29WZbczQg.xJ16Y2tq4LoYffARBV04nuKV6mK2DhS', 'Administrador del Sistema', 'ADMIN');

-- Datos semilla: productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, precio, stock_minimo) VALUES
('PRD-001', 'Laptop Dell Latitude 5440', 'Laptop empresarial 14 pulgadas, 16GB RAM', 1250.00, 5),
('PRD-002', 'Mouse Logitech MX Master 3', 'Mouse inalambrico ergonomico', 95.50, 15),
('PRD-003', 'Teclado Mecanico Keychron K8', 'Teclado mecanico inalambrico switches rojos', 110.00, 10),
('PRD-004', 'Monitor LG 27UP850 4K', 'Monitor 27 pulgadas UHD con USB-C', 420.00, 8),
('PRD-005', 'Docking Station USB-C Dell', 'Base de conexion universal con HDMI y Ethernet', 180.00, 12),
('PRD-006', 'Webcam Logitech C920', 'Camara web HD 1080p', 75.00, 20);

-- Movimientos iniciales para que el inventario semilla tenga stock real
CALL sp_registrar_entrada(1, 20, 1, 'Carga inicial de inventario');
CALL sp_registrar_entrada(2, 50, 1, 'Carga inicial de inventario');
CALL sp_registrar_entrada(3, 30, 1, 'Carga inicial de inventario');
CALL sp_registrar_entrada(4, 15, 1, 'Carga inicial de inventario');
CALL sp_registrar_entrada(5, 25, 1, 'Carga inicial de inventario');
CALL sp_registrar_entrada(6, 40, 1, 'Carga inicial de inventario');

-- Movimientos de salida para demostrar distintos estados de stock
CALL sp_registrar_salida(1, 16, 1, 'Entrega a departamento de TI');
CALL sp_registrar_salida(4, 10, 1, 'Entrega a sala de juntas');
