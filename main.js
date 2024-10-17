import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Сцена и камера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 11); // Попробуйте увеличить Y и уменьшить Z
camera.lookAt(0, 0, 0); // Убедитесь, что камера смотрит в центр сцены


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

//score 
let score = 0; // Переменная для хранения счета

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreValue');
  scoreDisplay.textContent = score; // Обновляем текст на панели со счетом
}


// Зелёный куб (игрок)
class Player extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: '#808' });
    super(geometry, material);
    this.position.y = 0;
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
  constructor(x, z, font, material) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // Используем переданный материал вместо фиксированного красного
    super(geometry, material); 
    this.position.set(x, 0, z);

    const textMaterial = new THREE.MeshStandardMaterial({ color: 'white' });

    // Сохраняем шрифт для последующего обновления текста
    this.font = font;

    // Инициализация значения текста
    this.currentTextValue = 2; // Начальное значение текста

    // Текст на лицевой грани куба
    this.frontTextGeometry = new TextGeometry(this.currentTextValue.toString(), {
      font: font,
      size: 0.8,
      depth: 0.1,
    });
    this.frontTextMesh = new THREE.Mesh(this.frontTextGeometry, textMaterial);
    this.frontTextMesh.position.set(-0.3, -0.3, 0.5);
    this.frontTextMesh.scale.set(0.95, 0.95, 1);
    this.add(this.frontTextMesh);

    // Текст на верхней грани куба
    this.topTextGeometry = new TextGeometry(this.currentTextValue.toString(), {
      font: font,
      size: 0.8,
      depth: 0.05,
    });
    this.topTextMesh = new THREE.Mesh(this.topTextGeometry, textMaterial);
    this.topTextMesh.rotation.x = -Math.PI / 2;
    this.topTextMesh.position.set(-0.3, 0.51, 0.4);
    this.topTextMesh.scale.set(0.95, 0.95, 1);
    this.add(this.topTextMesh);
  }

  // Метод для обновления значения текста
  updateText(newValue) {
    // Обновляем передний текст
    this.frontTextGeometry.dispose(); // Удаляем старую геометрию
    this.frontTextGeometry = new TextGeometry(newValue.toString(), {
      font: this.font,
      size: 0.8,
      depth: 0.1,
    });
    this.frontTextMesh.geometry = this.frontTextGeometry; // Заменяем геометрию меша

    // Обновляем верхний текст
    this.topTextGeometry.dispose(); // Удаляем старую геометрию
    this.topTextGeometry = new TextGeometry(newValue.toString(), {
      font: this.font,
      size: 0.8,
      depth: 0.05,
    });
    this.topTextMesh.geometry = this.topTextGeometry; // Заменяем геометрию меша
  }
}

// Загрузка шрифта и создание препятствий
let font;

const fontLoader = new FontLoader();
fontLoader.load('./public/font/helvetiker_bold.typeface.json', (font) => {
  createObstacles(font);
});

const createObstacles = (font) => {
  const startZ = -50; // Начальная позиция по Z
  const secondPairDistance = -40; // Начальная позиция по Z
  const wallZ = startZ - 21; // Позиция для стены
  
  //FISRT PAIR
  const greenMaterial = new THREE.MeshStandardMaterial({ color: '#00ff00' }); // Задаем зелёный цвет
  const greenObstacle = new Obstacle(-2, startZ, font, greenMaterial); // Передаем материал кубу
  greenObstacle.currentTextValue = 4; // Устанавливаем значение
  greenObstacle.updateText(greenObstacle.currentTextValue);
  obstacles.push(greenObstacle);
  scene.add(greenObstacle);

  const yellowMaterial = new THREE.MeshStandardMaterial({ color: '#ffff00' }); // Задаем жёлтый цвет
  const yellowObstacle = new Obstacle(2, startZ, font, yellowMaterial); // Передаем материал кубу
  yellowObstacle.currentTextValue = 8; // Устанавливаем значение
  yellowObstacle.updateText(yellowObstacle.currentTextValue);
  obstacles.push(yellowObstacle);
  scene.add(yellowObstacle);

  //SECOND PAIR
  const green2Obstacle = new Obstacle(-2, secondPairDistance, font, new THREE.MeshStandardMaterial({ color: '#00ff00' })); // Передаем материал кубу
  green2Obstacle.currentTextValue = 4; // Устанавливаем значение
  green2Obstacle.updateText(green2Obstacle.currentTextValue);
  obstacles.push(green2Obstacle);
  scene.add(green2Obstacle);

  // Создаем жёлтый куб со значением 8
  const yellow2Material = new THREE.MeshStandardMaterial({ color: '#ffff00' }); // Задаем жёлтый цвет
  const yellow2Obstacle = new Obstacle(2, secondPairDistance, font, yellow2Material); // Передаем материал кубу
  yellow2Obstacle.currentTextValue = 8; // Устанавливаем значение
  yellow2Obstacle.updateText(yellow2Obstacle.currentTextValue);
  obstacles.push(yellow2Obstacle);
  scene.add(yellow2Obstacle);

// Создание прозрачной зелёной стены
const wallGeometry = new THREE.BoxGeometry(10, 3, 0.10); // Размеры стены
const wallMaterial = new THREE.MeshStandardMaterial({ 
  color: '#00ff00', 
  transparent: true,  
  opacity: 0.5       
});
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.set(0, 1, wallZ);
scene.add(wall);

const wallTextMaterial = new THREE.MeshStandardMaterial({ color: 'white' });

const wallTextGeometry = new TextGeometry("UPDATE", {
  font: font, 
  size: 1.5,  
  depth: 0.1,
});

// Создаем меш для текста и позиционируем его
const wallTextMesh = new THREE.Mesh(wallTextGeometry, wallTextMaterial);
wallTextMesh.position.set(-4, -0.75, 0.06); // Размещаем текст на стене
wall.add(wallTextMesh);

// Добавляем логику столкновения со стеной
wall.userData.isWall = true; // Помечаем стену для проверки столкновений
wall.userData.shouldRemove = true; // Удаляем стену при столкновении
obstacles.push(wall); // Добавляем стену в массив препятствий
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

function checkCollisionBoundingBox(player, obstacle) {
  // Создаем bounding box для игрока и препятствия
  const playerBox = new THREE.Box3().setFromObject(player);
  const obstacleBox = new THREE.Box3().setFromObject(obstacle);

  // Проверяем пересечение двух bounding box
  return playerBox.intersectsBox(obstacleBox);
}

function increasePlayerSize() {
  player.scale.multiplyScalar(1.25); // Увеличиваем размер в 1.25 раза
}



function animate() {
  requestAnimationFrame(animate);

  // Двигаем игрока по X на основе позиции мыши
  player.move(mouseX);

  // Обновляем положение препятствий
  obstacles.forEach(obstacle => {
    obstacle.position.z += 0.15;

    // Проверка столкновений с игроком с использованием bounding box
    if (checkCollisionBoundingBox(player, obstacle)) {
        console.log('Столкновение с игроком!');

        // Обрабатываем логику столкновения
        if (obstacle.userData.isWall) {
            increasePlayerSize();
            if (obstacle.userData.shouldRemove) {
                scene.remove(obstacle);
            }
        }

        obstacle.position.z = player.position.z + 60;

        if (obstacle.currentTextValue) {
            score += obstacle.currentTextValue;
            updateScoreDisplay();
        }
    }
});


  // Обновляем положение синих сфер
  bullets.forEach((bullet, index) => {
    bullet.update();

    // Проверяем столкновения с каждым препятствием
    obstacles.forEach(obstacle => {
      if (checkCollision(bullet, obstacle)) {
        console.log('Столкновение сферы с препятствием!');
    
        // Если у препятствия ещё нет текста, установим начальное значение 2
        if (!obstacle.currentTextValue) {
          obstacle.currentTextValue = 2;
        } else {
          obstacle.currentTextValue += 1; // Увеличиваем текущее значение текста на 1
        }

        // Обновляем текст на кубе
        obstacle.updateText(obstacle.currentTextValue);

        // Убираем сферу после столкновения
        scene.remove(bullet);
        bullets.splice(index, 1);
      }
    });

    // Если сфера ушла далеко, удаляем её
    if (bullet.position.z < player.position.z - 100) {
      scene.remove(bullet);
      bullets.splice(index, 1);
    }
  });

  // Рендер сцены
  renderer.render(scene, camera);
}

animate();