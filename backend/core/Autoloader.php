<?php

namespace core;

class Autoloader {
    public static function register() : void {
        spl_autoload_register([__CLASS__, 'autoload']);
    }

    public static function autoload(string $className) : void {
        $classPath = str_replace('\\', DIRECTORY_SEPARATOR, $className);

        $baseDirectory = dirname(__DIR__) . DIRECTORY_SEPARATOR;

        $filePath = $baseDirectory . $classPath . '.php';

        if (file_exists($filePath)) {
            require_once $filePath;
        } else {
            http_response_code(500);
            die("Autoload failure. Class: " . $className . " | Path: " . $filePath);
        }
    }
}