#version 330 core
struct Material
{
	sampler2D diffuse;
	sampler2D specular;
	float shininess;
};

struct Light
{
	// lightVector.w == 0.0 ƽ�й�	xyzΪƽ�йⷽ��
	// lightVector.w == 0.5 �۹��	xyzΪ�۹��position
	// lightVector.w == 1.0 ���Դ	xyzΪ���Դposition
	vec4 lightVector;
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;

	// spotlight
	vec3 spotDir;
	float cutOff;		// �۹�ƿ�ʼ˥��ʱ�Ƕȵ�cosֵ
	float outerCutOff;	// �۹������Ե ����˥����0��cosֵ
	
	// pointlight
	float constant;
	float linear;
	float quadratic;
};

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

out vec4 color;

uniform vec3 viewPos;
uniform Material material;
uniform Light light;

void main()
{
	// base value
	vec3 norm;	
	vec3 viewDir;
	vec3 reflectDir;
	vec3 lightDir;
	
	norm = normalize(Normal);
	viewDir = normalize(viewPos - FragPos);
	reflectDir = reflect(-lightDir, norm);

	if(light.lightVector.w == 0.0f)
		lightDir = normalize(-light.lightVector.xyz);
	else if(light.lightVector.w == 1.0f || light.lightVector.w == 0.5f)	// point light or spotlight
		lightDir = normalize(light.lightVector.xyz - FragPos);


	// phong lighting
	float diff;
	float spec;

	// result
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;

	// Ambient	
	ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
	// Diffuse
	diff = max(dot(norm, lightDir), 0.0f);
	diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords));	
	// Specular
	spec = pow(max(dot(viewDir, reflectDir), 0.0f), material.shininess);
	specular = light.specular * spec * vec3(texture(material.specular, TexCoords));


	// Attenuation
	if(light.lightVector.w == 1.0f)			// pointlight
	{
		float distance = length(light.lightVector.xyz - FragPos);
		float attenuation = 1.0f / (light.constant + light.linear*distance + light.quadratic*(distance*distance));

		ambient *= attenuation;
		diffuse *= attenuation;
		specular *= attenuation;
	}	
	else if(light.lightVector.w == 0.5f)	// spotlight
	{
		float theta = dot(lightDir, normalize(-light.spotDir)); // ���� ��Դ��Ƭ������ �� ��Դ��ǰ������ �γɼнǵ�cosֵ
		float epsilon = light.cutOff - light.outerCutOff;
		float spotIntensity = clamp((theta - light.outerCutOff) / epsilon, 0.0f, 1.0f);

		ambient *= spotIntensity;
		diffuse *= spotIntensity;
		specular *= spotIntensity;

		float distance = length(light.lightVector.xyz - FragPos);
		float attenuation = 1.0f / (light.constant + light.linear*distance + light.quadratic*(distance*distance));

		ambient *= attenuation;
		diffuse *= attenuation;
		specular *= attenuation;
	}
	

	color = vec4(ambient + diffuse + specular, 1.0f);
}
