/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Solo documentación
        'style',    // Formato, espacios (sin cambio de lógica)
        'refactor', // Refactoring sin nueva feature ni bug fix
        'test',     // Agregar o corregir tests
        'chore',    // Mantenimiento, herramientas, dependencias
        'build',    // Cambios en sistema de build o dependencias externas
        'ci',       // Cambios en CI/CD pipelines
        'perf',     // Mejoras de rendimiento
        'revert',   // Revertir un commit previo
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],  
  },
};
