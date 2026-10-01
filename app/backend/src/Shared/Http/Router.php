<?php

declare(strict_types=1);

namespace App\Shared\Http;

final class Router
{
    /** @var array<int, array{method:string, pattern:string, handler:callable, middlewares:array<int, \App\Shared\Http\Middleware\MiddlewareInterface>}> */
    private array $routes = [];

    /**
     * @param array<int, \App\Shared\Http\Middleware\MiddlewareInterface> $middlewares
     */
    public function add(string $method, string $pattern, callable $handler, array $middlewares = []): void
    {
        $this->routes[] = [
            'method'      => strtoupper($method),
            'pattern'     => $pattern,
            'handler'     => $handler,
            'middlewares' => $middlewares,
        ];
    }

    /** @param array<int, \App\Shared\Http\Middleware\MiddlewareInterface> $middlewares */
    public function get(string $pattern, callable $handler, array $middlewares = []): void    { $this->add('GET', $pattern, $handler, $middlewares); }
    /** @param array<int, \App\Shared\Http\Middleware\MiddlewareInterface> $middlewares */
    public function post(string $pattern, callable $handler, array $middlewares = []): void   { $this->add('POST', $pattern, $handler, $middlewares); }
    /** @param array<int, \App\Shared\Http\Middleware\MiddlewareInterface> $middlewares */
    public function put(string $pattern, callable $handler, array $middlewares = []): void    { $this->add('PUT', $pattern, $handler, $middlewares); }
    /** @param array<int, \App\Shared\Http\Middleware\MiddlewareInterface> $middlewares */
    public function delete(string $pattern, callable $handler, array $middlewares = []): void { $this->add('DELETE', $pattern, $handler, $middlewares); }

    public function dispatch(string $method, string $path): void
    {
        $method = strtoupper($method);

        if ($method === 'OPTIONS') {
            JsonResponse::send(null, 204);
            return;
        }

        $path = '/' . trim(parse_url($path, PHP_URL_PATH) ?? '/', '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            $regex = '#^' . preg_replace('#\{([a-zA-Z_]+)\}#', '(?P<$1>[^/]+)', $route['pattern']) . '$#';
            if (preg_match($regex, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                // Exécution des middlewares
                foreach ($route['middlewares'] as $middleware) {
                    if (!$middleware->handle()) {
                        // Le middleware a échoué et géré la réponse
                        return;
                    }
                }

                ($route['handler'])($params);
                return;
            }
        }

        JsonResponse::error("Route introuvable : {$method} {$path}", 404, 'ROUTE_NOT_FOUND');
    }
}
