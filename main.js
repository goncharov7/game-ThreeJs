import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Сцена и камера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1.8, 10, 11);
camera.lookAt(0, 0, 0);

// Рендерер
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Управление камерой
const controls = new OrbitControls(camera, renderer.domElement);

// Дорога
class Road extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(10, 800);
    const material = new THREE.MeshStandardMaterial({ color: '#808080' });
    super(geometry, material);
    this.rotation.x = -Math.PI / 2;
    this.position.y = -0.5;
  }
}

const road = new Road();
scene.add(road);

// Зелёный куб (игрок)
class Player extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: '#00ff00' });
    super(geometry, material);
    this.position.y = 0.5;
  }

  move(x) {
    this.position.x = THREE.MathUtils.clamp(x, -4.5, 4.5);
  }
}

const player = new Player();
scene.add(player);

// Объявление массива obstacles
const obstacles = [];

// Препятствия (красные кубы)
class Obstacle extends THREE.Mesh {
  constructor(x, z, font) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 'red' });
    super(geometry, material);
    this.position.set(x, 0.5, z);

    const textMaterial = new THREE.MeshStandardMaterial({ color: 'white' });

    // Текст на лицевой грани куба
    const frontTextGeometry = new TextGeometry('2', {
      font: font,
      size: 0.8,
      depth: 0.1,
    });
    const frontTextMesh = new THREE.Mesh(frontTextGeometry, textMaterial);
    frontTextMesh.position.set(-0.3, -0.3, 0.5); // Центрируем текст на передней грани
    frontTextMesh.scale.set(0.95, 0.95, 1); // Масштабируем текст, чтобы покрывал почти всю грань
    this.add(frontTextMesh);

    // Текст на верхней грани куба
    const topTextGeometry = new TextGeometry('2', {
      font: font,
      size: 0.8, // Увеличиваем размер текста до 1
      depth: 0.05, // Толщина текста
    });
    const topTextMesh = new THREE.Mesh(topTextGeometry, textMaterial);

    // Позиционируем текст на верхней грани
    topTextMesh.rotation.x = -Math.PI / 2; // Поворачиваем текст, чтобы он лежал на верхней грани
    topTextMesh.position.set(-0.3, 0.51, 0.4); // Центрируем текст на верхней грани
    topTextMesh.scale.set(0.95, 0.95, 1); // Масштабируем текст для покрытия всей верхней грани
    this.add(topTextMesh);
  }

  // Метод для обновления значения текста на кубе
  updateText(newValue, font) {
  const textMaterial = new THREE.MeshStandardMaterial({ color: 'white' });

  // Удаляем старые текстовые объекты
  this.children.forEach((child) => {
    if (child.geometry instanceof TextGeometry) {
      this.remove(child);
      child.geometry.dispose(); // Освобождаем ресурсы
      child.material.dispose(); // Освобождаем материалы
    }
  });

  // Создаем новый текст для передней грани
  const frontTextGeometry = new TextGeometry(newValue.toString(), {
    font: font,
    size: 0.8,
    depth: 0.1,
  });
  const frontTextMesh = new THREE.Mesh(frontTextGeometry, textMaterial);
  frontTextMesh.position.set(-0.3, -0.3, 0.5); // Центрируем текст на передней грани
  frontTextMesh.scale.set(0.95, 0.95, 1); // Масштабируем текст
  this.add(frontTextMesh);

  // Создаем новый текст для верхней грани
  const topTextGeometry = new TextGeometry(newValue.toString(), {
    font: font,
    size: 0.8, // Размер текста
    depth: 0.05, // Толщина текста
  });
  const topTextMesh = new THREE.Mesh(topTextGeometry, textMaterial);
  topTextMesh.rotation.x = -Math.PI / 2; // Поворачиваем текст для верхней грани
  topTextMesh.position.set(-0.3, 0.51, 0.4); // Центрируем текст на верхней грани
  topTextMesh.scale.set(0.95, 0.95, 1); // Масштабируем текст для покрытия всей верхней грани
  this.add(topTextMesh);
  }
}


// Загрузка шрифта и создание препятствий
let font;

const fontLoader = new FontLoader();
fontLoader.load('./public/font/helvetiker_bold.typeface.json', (font) => {
  createObstacles(font);
});

// Создаем 3 ряда по 2 куба
const createObstacles = (font) => {
  const startZ = -50; // Начальная позиция по Z
  const spacing = 10; // Расстояние между рядами
  const rowOffset = 3; // Расстояние между кубами в ряду

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const x = (col - 0.5) * rowOffset * 2; // Позиционируем кубы
      const z = startZ + row * spacing; // Расстояние между рядами
      const obstacle = new Obstacle(x, z, font); // Создание препятствия
      obstacles.push(obstacle);
      scene.add(obstacle); // Добавляем препятствие в сцену
    }
  }
};

// Свет
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 5, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Управление мышью
let mouseX = 0;
window.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 10 - 5;
});

// Управление касанием (для телефона)
window.addEventListener('touchmove', (event) => {
  const touch = event.touches[0];
  mouseX = (touch.clientX / window.innerWidth) * 10 - 5;
});

// Сфера (снаряд)
class BlueSphere extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 'blue' });
    super(geometry, material);
    this.velocity = new THREE.Vector3(0, 0, -1); // Задаем начальную скорость сферы
  }

  // Метод для обновления позиции сферы
  update() {
    this.position.add(this.velocity);
  }
}

// Массив для хранения снарядов
const bullets = [];

// Функция стрельбы синими сферами
function shoot() {
  const bullet = new BlueSphere();
  bullet.position.set(player.position.x, player.position.y, player.position.z); // Стартовая позиция сферы - позиция игрока
  bullets.push(bullet); // Добавляем сферу в массив
  scene.add(bullet); // Добавляем сферу в сцену
}

// Запускаем автоматическую стрельбу
setInterval(() => {
  shoot(); // Вызываем функцию стрельбы
}, 1000); // Интервал в 1000 мс (1 секунда)

// Функция для проверки столкновений сферы с препятствием
function checkCollision(bullet, obstacle) {
  const distance = bullet.position.distanceTo(obstacle.position);
  return distance < 1; // Если расстояние меньше 1, значит произошло столкновение
}

// Обновление текста на кубе при столкновении
function animate() {
  requestAnimationFrame(animate);

  // Двигаем игрока по X на основе позиции мыши
  player.move(mouseX);

  // Обновляем положение препятствий
  obstacles.forEach(obstacle => {
    // Двигаем препятствия к игроку по оси Z
    obstacle.position.z += 0.1;

    // Проверка столкновений с игроком
    if (Math.abs(obstacle.position.x - player.position.x) < 1 &&
        Math.abs(obstacle.position.z - player.position.z) < 1) {
      console.log('Столкновение с игроком!');
      // Перемещаем куб назад после столкновения
      obstacle.position.z = player.position.z + 60;
    }
  });

  // Обновляем положение синих сфер
  bullets.forEach((bullet, index) => {
    bullet.update(); // Обновляем позицию сферы

    // Проверяем столкновения с каждым препятствием
    obstacles.forEach(obstacle => {
      if (checkCollision(bullet, obstacle)) {
        console.log('Столкновение сферы с препятствием!');

        // Увеличиваем значение на кубе на 1
        const currentText = parseInt(obstacle.children[0].geometry.parameters.text) || 0; // Сначала проверяем, если значение text существует
        obstacle.updateText(currentText + 1, font); // Обновляем текст с учетом загруженного шрифта

        // Убираем сферу после столкновения
        scene.remove(bullet);
        bullets.splice(index, 1);
      }
    });

    // Если сфера ушла далеко, удаляем её из сцены
    if (bullet.position.z < player.position.z - 100) {
      scene.remove(bullet);
      bullets.splice(index, 1);
    }
  });

  // Рендер сцены
  renderer.render(scene, camera);
}


animate();